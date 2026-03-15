import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_KEY,
});

// Map persona slugs to their LoRA config
export const PERSONA_LORAS: Record<
  string,
  { url: string; scale: number; triggerWord: string }
> = {
  valentina: {
    url: "https://v3b.fal.media/files/b/0a92136c/ay7GwK-EqJNSRm-2DvnSd_cabn-valentina.safetensors",
    scale: 1.0,
    triggerWord: "VALENTINA",
  },
  hannah: {
    url: "https://v3b.fal.media/files/b/0a923bed/fSD9Lak38k6oMxgY5xntH_hannah_lora_v2.safetensors",
    scale: 0.75,
    triggerWord: "HANNAH",
  },
};

export async function queueFalRun(personaSlug: string, prompt: string) {
  const lora = PERSONA_LORAS[personaSlug];

  const result = await fal.queue.submit("fal-ai/flux-lora", {
    input: {
      prompt,
      image_size: { width: 896, height: 1152 },
      num_inference_steps: 40,
      guidance_scale: 2.0,
      num_images: 1,
      output_format: "jpeg",
      enable_safety_checker: false,
      ...(lora
        ? {
            loras: [{ path: lora.url, scale: lora.scale }],
          }
        : {}),
    },
  });

  return { requestId: result.request_id };
}

export async function getFalRunStatus(requestId: string) {
  const status = await fal.queue.status("fal-ai/flux-lora", {
    requestId,
    logs: false,
  });

  if (status.status === "COMPLETED") {
    const result = await fal.queue.result("fal-ai/flux-lora", { requestId });
    const data = result.data as {
      images?: Array<{ url: string; width: number; height: number }>;
    };
    const imageUrl = data?.images?.[0]?.url;

    return {
      status: "succeeded" as const,
      imageUrl,
    };
  }

  // IN_QUEUE or IN_PROGRESS
  return { status: "processing" as const, imageUrl: undefined };
}
