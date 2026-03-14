import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { anthropic } from "@/lib/anthropic";
import { getPersonaBySlug } from "@/data/personas";

const MAX_CONTEXT_MESSAGES = 50;
const MAX_MEMORY_FACTS = 100;

type MemoryCategory = { category: string; facts: string[] };

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server component context
          }
        },
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabase();

    // Verify auth
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, personaSlug, followUp, imageUrl } = await request.json();

    if ((!message && !followUp && !imageUrl) || !personaSlug) {
      return Response.json({ error: "Missing message or persona" }, { status: 400 });
    }

    const persona = getPersonaBySlug(personaSlug);
    if (!persona) {
      return Response.json({ error: "Persona not found" }, { status: 404 });
    }

    // Get or create conversation
    let { data: conversation } = await supabase
      .from("conversations")
      .select("id")
      .eq("user_id", user.id)
      .eq("persona_slug", personaSlug)
      .single();

    if (!conversation) {
      const { data: newConv, error: convError } = await supabase
        .from("conversations")
        .insert({ user_id: user.id, persona_slug: personaSlug })
        .select("id")
        .single();

      if (convError) {
        return Response.json({ error: "Failed to create conversation" }, { status: 500 });
      }
      conversation = newConv;
    }

    // Save user message (skip for follow-ups)
    if (!followUp && (message || imageUrl)) {
      const content = imageUrl
        ? message ? `[IMAGE: ${imageUrl}] ${message}` : `[IMAGE: ${imageUrl}]`
        : message;
      await supabase.from("messages").insert({
        conversation_id: conversation.id,
        role: "user",
        content,
      });
    }

    // Get the most recent messages for context (fetch descending, then reverse to chronological)
    const { data: historyDesc } = await supabase
      .from("messages")
      .select("role, content, image_url")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: false })
      .limit(MAX_CONTEXT_MESSAGES);

    const history = historyDesc ? [...historyDesc].reverse() : [];

    // Build messages array, converting [IMAGE: url] tags to vision content
    type TextBlock = { type: "text"; text: string };
    type ImageBlock = { type: "image"; source: { type: "url"; url: string } };
    type ContentBlock = TextBlock | ImageBlock;
    type ApiMessage = { role: "user" | "assistant"; content: string | ContentBlock[] };

    // Filter out empty messages from history (corrupted data)
    const validHistory = history.filter((msg) => msg.content && msg.content.trim().length > 0);

    const rawMessages: ApiMessage[] = [];
    for (const msg of validHistory) {
      const role = msg.role as "user" | "assistant";
      // User-sent images via [IMAGE: url] tag
      const imageMatch = msg.content.match(/\[IMAGE:\s*(https?:\/\/[^\]]+)\]/);
      if (imageMatch && role === "user") {
        const url = imageMatch[1];
        const textPart = msg.content.replace(/\[IMAGE:\s*https?:\/\/[^\]]+\]/, "").trim();
        const content: ContentBlock[] = [
          { type: "image", source: { type: "url", url } },
        ];
        if (textPart) {
          content.push({ type: "text", text: textPart });
        } else {
          content.push({ type: "text", text: "The user sent you a photo." });
        }
        rawMessages.push({ role, content });
        continue;
      }
      // Assistant message
      rawMessages.push({ role, content: msg.content });
      // If the assistant sent a photo, inject it as a user context message so the persona can see it
      if (role === "assistant" && msg.image_url && msg.image_url.startsWith("http")) {
        rawMessages.push({
          role: "user",
          content: [
            { type: "text", text: "[System: this is the photo you just sent — you can see it to reference in future messages. Do not describe it back unless asked.]" },
            { type: "image", source: { type: "url", url: msg.image_url } },
          ],
        });
      }
    }

    // Merge consecutive same-role messages (text-only)
    const messages: ApiMessage[] = [];
    for (const msg of rawMessages) {
      if (
        messages.length > 0 &&
        messages[messages.length - 1].role === msg.role &&
        typeof messages[messages.length - 1].content === "string" &&
        typeof msg.content === "string"
      ) {
        (messages[messages.length - 1] as { role: string; content: string }).content += " " + msg.content;
      } else {
        messages.push({ ...msg });
      }
    }

    // Fetch stored memories for this user+persona
    const { data: memoryRow } = await supabase
      .from("persona_memories")
      .select("memories")
      .eq("user_id", user.id)
      .eq("persona_slug", personaSlug)
      .single();

    const storedMemories: MemoryCategory[] = (memoryRow?.memories as MemoryCategory[]) || [];

    // Build memory context to inject into system prompt
    let memoryContext = "";
    if (storedMemories.length > 0) {
      const lines = storedMemories.map(
        (cat) => `${cat.category}: ${cat.facts.join("; ")}`
      );
      memoryContext = `\n\nTHINGS YOU REMEMBER ABOUT THIS PERSON:\n${lines.join("\n")}\nUse this knowledge naturally — don't list it back or make it obvious you're recalling facts. Just let it inform how you talk to them, like a real friend would.`;
    }

    // For follow-ups, add instruction to send a natural follow-up question
    const systemPrompt = followUp
      ? persona.systemPrompt + memoryContext + "\n\nThe user hasn't responded in a while. Send a casual follow-up text like a real person would — ask a question, share a random thought, or bring up something from earlier in the conversation. Keep it natural and short, like you just thought of something."
      : persona.systemPrompt + memoryContext;

    // For follow-ups, add a nudge as the last user message
    const apiMessages = followUp
      ? [...messages, { role: "user" as const, content: "[The user hasn't replied yet]" }]
      : messages;

    // Ensure conversation starts with a user message
    if (apiMessages.length === 0) {
      apiMessages.push({ role: "user", content: message || "hi" });
    } else if (apiMessages[0].role !== "user") {
      apiMessages.unshift({ role: "user", content: "hi" });
    }

    console.log("[chat] Sending to Claude:", apiMessages.length, "messages, followUp:", !!followUp);

    // Deduplicate: scan for repeated assistant messages and add a reminder
    const assistantMessages = apiMessages.filter(m => m.role === "assistant" && typeof m.content === "string");
    const lastThree = assistantMessages.slice(-3).map(m => (m.content as string).toLowerCase().trim());
    const hasRepetition = lastThree.length >= 2 && new Set(lastThree).size < lastThree.length;

    const finalSystem = hasRepetition
      ? systemPrompt + "\n\nCRITICAL: You have been repeating yourself in this conversation. Your last few messages were nearly identical. You MUST say something completely different this time. Change the topic, react differently, or say something unexpected."
      : systemPrompt;

    // Stream response from Claude
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      temperature: 1.0,
      system: finalSystem,
      messages: apiMessages as any,
    });

    let fullResponse = "";

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              fullResponse += event.delta.text;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
              );
            }
          }

          // Parse and save any memory tags from the response
          const newMemories: { category: string; fact: string }[] = [];
          let memMatch;
          const memRegex = /\[MEMORY:\s*([^|]+?)\s*\|\s*(.+?)\]/g;
          while ((memMatch = memRegex.exec(fullResponse)) !== null) {
            newMemories.push({
              category: memMatch[1].trim(),
              fact: memMatch[2].trim(),
            });
          }

          if (newMemories.length > 0) {
            // Merge new facts into existing memory hierarchy
            const currentMemories: MemoryCategory[] = [...storedMemories];
            let totalFacts = currentMemories.reduce((sum, cat) => sum + cat.facts.length, 0);

            for (const { category, fact } of newMemories) {
              if (totalFacts >= MAX_MEMORY_FACTS) break;

              const existing = currentMemories.find(
                (cat) => cat.category.toLowerCase() === category.toLowerCase()
              );

              if (existing) {
                // Skip duplicate facts
                const isDuplicate = existing.facts.some(
                  (f) => f.toLowerCase() === fact.toLowerCase()
                );
                if (!isDuplicate) {
                  existing.facts.push(fact);
                  totalFacts++;
                }
              } else {
                currentMemories.push({ category, facts: [fact] });
                totalFacts++;
              }
            }

            // Upsert the memory row
            await supabase
              .from("persona_memories")
              .upsert(
                {
                  user_id: user.id,
                  persona_slug: personaSlug,
                  memories: currentMemories,
                  updated_at: new Date().toISOString(),
                },
                { onConflict: "user_id,persona_slug" }
              );
          }

          // Save assistant message after streaming completes
          // Replace SEND_PHOTO with a context marker so the persona remembers it sent a photo
          // Strip memory tags entirely (they're persisted separately)
          const cleanContent = fullResponse
            .replace(/\n+/g, " ")
            .replace(/\[SEND_PHOTO:\s*(.+?)\]/g, "[You sent a photo: $1]")
            .replace(/\[MEMORY:\s*[^|]+?\s*\|\s*.+?\]/g, "")
            .trim();
          if (cleanContent) {
            await supabase.from("messages").insert({
              conversation_id: conversation.id,
              role: "assistant",
              content: cleanContent,
            });
          }

          // Update last_message_at
          await supabase
            .from("conversations")
            .update({ last_message_at: new Date().toISOString() })
            .eq("id", conversation.id);

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          console.error("Stream error:", err);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("Chat API error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
