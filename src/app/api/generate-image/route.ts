import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import {
  replicate,
  PERSONA_LORA_MODELS,
  PERSONA_TRIGGER_WORDS,
} from "@/lib/replicate";

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

    const modelVersion = PERSONA_LORA_MODELS[personaSlug];
    if (!modelVersion) {
      console.log("[generate-image] No model for persona:", personaSlug);
      return Response.json(
        { error: "No image model available for this persona" },
        { status: 404 }
      );
    }

    const triggerWord = PERSONA_TRIGGER_WORDS[personaSlug] || personaSlug.toUpperCase();
    const realism = "candid iPhone photo, natural skin texture, slight imperfections, no airbrushing, no filters, real life, not ai generated";
    const imagePrompt = prompt
      ? `a photo of ${triggerWord}, ${prompt}, ${realism}`
      : `a casual selfie photo of ${triggerWord}, natural lighting, ${realism}`;

    // Extract version hash from "owner/model:version" format
    const versionHash = modelVersion.split(":")[1];

    console.log("[generate-image] Creating prediction with version:", versionHash);
    console.log("[generate-image] Prompt:", imagePrompt);

    // Create prediction asynchronously — returns immediately, client polls for result
    const prediction = await replicate.predictions.create({
      version: versionHash,
      input: {
        prompt: imagePrompt,
        num_outputs: 1,
        guidance_scale: 2.5,
        num_inference_steps: 36,
        output_format: "webp",
        output_quality: 90,
      },
    });

    console.log("[generate-image] Prediction created:", prediction.id, prediction.status);

    return Response.json({ predictionId: prediction.id });
  } catch (err) {
    console.error("[generate-image] Error:", err);
    return Response.json(
      { error: "Failed to start image generation" },
      { status: 500 }
    );
  }
}
