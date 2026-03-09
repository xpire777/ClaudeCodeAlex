import Replicate from "replicate";

export const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

// Map persona slugs to their trained LoRA model versions on Replicate
export const PERSONA_LORA_MODELS: Record<string, string> = {
  valentina:
    "xpire777/cabn-valentina:fb25ae814522ce254cfb255288d533b90e2acd384abd0cc0bfb93e14baf404a5",
};

// Trigger words used during training
export const PERSONA_TRIGGER_WORDS: Record<string, string> = {
  valentina: "VALENTINA",
};
