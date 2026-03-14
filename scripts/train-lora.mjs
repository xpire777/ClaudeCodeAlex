import { fal } from "@fal-ai/client";
import fs from "fs";

fal.config({
  credentials: process.env.FAL_KEY,
});

const zipPath = process.argv[2];
const triggerWord = process.argv[3] || "PERSON";

if (!zipPath) {
  console.log("Usage: node scripts/train-lora.mjs <zip-file> [trigger-word]");
  console.log("Example: node scripts/train-lora.mjs /tmp/hannah-training.zip HANNAH");
  process.exit(1);
}

console.log("Uploading training images...");
const zipBuffer = fs.readFileSync(zipPath);
const file = new File([zipBuffer], "training-images.zip", { type: "application/zip" });
const zipUrl = await fal.storage.upload(file);
console.log("  Uploaded:", zipUrl);

console.log(`\nStarting LoRA training with trigger word: ${triggerWord}`);
console.log("This will take 10-20 minutes...\n");

const result = await fal.subscribe("fal-ai/flux-lora-fast-training", {
  input: {
    images_data_url: zipUrl,
    trigger_word: triggerWord,
    steps: 1000,
    is_style: false,
    create_masks: true,
    is_input_format_already_preprocessed: false,
  },
  logs: true,
  onQueueUpdate: (update) => {
    if (update.status === "IN_PROGRESS" && update.logs) {
      update.logs.forEach((log) => console.log(`  [training] ${log.message}`));
    } else {
      console.log(`  Status: ${update.status}`);
    }
  },
});

console.log("\nTraining complete!");
console.log("LoRA weights URL:", result.data.diffusers_lora_file?.url);
console.log("\nFull result:", JSON.stringify(result.data, null, 2));
