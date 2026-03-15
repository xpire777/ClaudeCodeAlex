import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { PERSONA_LORAS, queueFalRun } from "@/lib/fal";

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

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { personaSlug, prompt } = await request.json();

    if (!personaSlug) {
      return Response.json(
        { error: "Missing persona slug" },
        { status: 400 }
      );
    }

    const lora = PERSONA_LORAS[personaSlug];
    if (!lora) {
      console.log("[generate-image] No LoRA config for persona:", personaSlug);
      return Response.json(
        { error: "No image model available for this persona" },
        { status: 404 }
      );
    }

    if (!process.env.FAL_KEY) {
      console.error("[generate-image] FAL_KEY is not set!");
      return Response.json(
        { error: "Server misconfiguration: missing API key" },
        { status: 500 }
      );
    }

    const triggerWord = lora.triggerWord;
    const quality = "raw photo taken on iphone 14, front camera selfie, holding phone in one hand, arm length distance, slightly out of focus, jpeg artifacts, low quality camera, no makeup or light makeup, visible pores and blemishes, uneven skin tone, flat harsh lighting from phone screen, slight wide angle lens distortion, messy background, not retouched, not professional photography, real amateur snapshot, shot on mobile phone, correct human anatomy, exactly two arms, exactly two legs, correct hands with five fingers each, normal human body proportions, single person only";
    const imagePrompt = prompt
      ? `a photo of ${triggerWord}, ${triggerWord} person, ${prompt}, ${quality}`
      : `a photo of ${triggerWord}, ${triggerWord} person, casual selfie, ${quality}`;

    console.log("[generate-image] Queuing fal.ai run for:", personaSlug);
    console.log("[generate-image] Prompt:", imagePrompt);

    const { requestId } = await queueFalRun(personaSlug, imagePrompt);

    console.log("[generate-image] Run queued:", requestId);

    return Response.json({ predictionId: requestId });
  } catch (err) {
    console.error("[generate-image] Error:", err instanceof Error ? err.message : err);
    console.error("[generate-image] Stack:", err instanceof Error ? err.stack : "no stack");
    return Response.json(
      { error: `Failed to start image generation: ${err instanceof Error ? err.message : "unknown"}` },
      { status: 500 }
    );
  }
}
