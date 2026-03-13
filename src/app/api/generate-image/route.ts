import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import {
  PERSONA_DEPLOYMENTS,
  PERSONA_TRIGGER_WORDS,
  queueComfyRun,
} from "@/lib/comfydeploy";

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

    const deploymentId = PERSONA_DEPLOYMENTS[personaSlug];
    if (!deploymentId) {
      console.log("[generate-image] No deployment for persona:", personaSlug);
      return Response.json(
        { error: "No image model available for this persona" },
        { status: 404 }
      );
    }

    const triggerWord = PERSONA_TRIGGER_WORDS[personaSlug] || personaSlug.toUpperCase();
    const quality = "sharp focus, high resolution, neutral white balance, balanced exposure, cool natural daylight, detailed face, clear eyes, crisp details, photorealistic, shot on iPhone 15 Pro";
    const imagePrompt = prompt
      ? `a photo of ${triggerWord}, ${prompt}, ${quality}`
      : `a casual selfie photo of ${triggerWord}, bright natural daylight, ${quality}`;

    if (!process.env.COMFY_DEPLOY_API_KEY) {
      console.error("[generate-image] COMFY_DEPLOY_API_KEY is not set!");
      return Response.json(
        { error: "Server misconfiguration: missing API key" },
        { status: 500 }
      );
    }

    console.log("[generate-image] Queuing ComfyDeploy run for:", personaSlug);
    console.log("[generate-image] Prompt:", imagePrompt);

    const { run_id } = await queueComfyRun(deploymentId, imagePrompt);

    console.log("[generate-image] Run queued:", run_id);

    return Response.json({ predictionId: run_id });
  } catch (err) {
    console.error("[generate-image] Error:", err instanceof Error ? err.message : err);
    console.error("[generate-image] Stack:", err instanceof Error ? err.stack : "no stack");
    return Response.json(
      { error: `Failed to start image generation: ${err instanceof Error ? err.message : "unknown"}` },
      { status: 500 }
    );
  }
}
