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

    // Verify auth
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
      return Response.json(
        { error: "No image model available for this persona" },
        { status: 404 }
      );
    }

    const triggerWord = PERSONA_TRIGGER_WORDS[personaSlug] || personaSlug.toUpperCase();

    // Build the image prompt
    const imagePrompt = prompt
      ? `a photo of ${triggerWord}, ${prompt}`
      : `a casual selfie photo of ${triggerWord}, natural lighting, realistic, high quality`;

    const output = await replicate.run(modelVersion as `${string}/${string}:${string}`, {
      input: {
        prompt: imagePrompt,
        num_outputs: 1,
        guidance_scale: 3.5,
        num_inference_steps: 28,
        output_format: "webp",
        output_quality: 90,
      },
    });

    // Output is an array of file URLs
    const images = output as unknown[];
    if (!images || images.length === 0) {
      return Response.json(
        { error: "No image generated" },
        { status: 500 }
      );
    }

    // The output could be a ReadableStream or URL string
    const firstImage = images[0];
    let imageUrl: string;

    if (typeof firstImage === "string") {
      imageUrl = firstImage;
    } else if (firstImage && typeof firstImage === "object" && "url" in (firstImage as Record<string, unknown>)) {
      imageUrl = (firstImage as { url: string }).url;
    } else {
      // It might be a FileOutput with a toString/url
      imageUrl = String(firstImage);
    }

    return Response.json({ imageUrl });
  } catch (err) {
    console.error("Image generation error:", err);
    return Response.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
