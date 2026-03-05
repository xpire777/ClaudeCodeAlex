import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { anthropic } from "@/lib/anthropic";
import { getPersonaBySlug } from "@/data/personas";

const MAX_CONTEXT_MESSAGES = 50;

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

    const { message, personaSlug, followUp } = await request.json();

    if ((!message && !followUp) || !personaSlug) {
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
    if (message && !followUp) {
      await supabase.from("messages").insert({
        conversation_id: conversation.id,
        role: "user",
        content: message,
      });
    }

    // Get conversation history for context
    const { data: history } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true })
      .limit(MAX_CONTEXT_MESSAGES);

    // Ensure messages alternate roles (Claude API requirement)
    const rawMessages = (history || []).map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    const messages: { role: "user" | "assistant"; content: string }[] = [];
    for (const msg of rawMessages) {
      if (messages.length > 0 && messages[messages.length - 1].role === msg.role) {
        // Merge consecutive same-role messages
        messages[messages.length - 1].content += " " + msg.content;
      } else {
        messages.push({ ...msg });
      }
    }

    // For follow-ups, add instruction to send a natural follow-up question
    const systemPrompt = followUp
      ? persona.systemPrompt + "\n\nThe user hasn't responded in a while. Send a casual follow-up text like a real person would — ask a question, share a random thought, or bring up something from earlier in the conversation. Keep it natural and short, like you just thought of something."
      : persona.systemPrompt;

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

    // Stream response from Claude
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 150,
      system: systemPrompt,
      messages: apiMessages,
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

          // Save assistant message after streaming completes
          await supabase.from("messages").insert({
            conversation_id: conversation.id,
            role: "assistant",
            content: fullResponse.replace(/\n+/g, " ").trim(),
          });

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
