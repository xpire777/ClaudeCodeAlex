import { fal } from "@fal-ai/client";
import fs from "fs";
import path from "path";

fal.config({
  credentials: process.env.FAL_KEY,
});

const refImagePath = process.argv[2];
const prompt = process.argv[3];
const outputDir = process.argv[4] || "./generated-images";
const count = parseInt(process.argv[5] || "1", 10);
const strength = parseFloat(process.argv[6] || "0.75");

if (!refImagePath || !prompt) {
  console.log("Usage: node scripts/generate-from-reference.mjs <reference-image> <prompt> [output-dir] [count] [strength]");
  console.log("");
  console.log("  strength: 0.0 = keep original, 1.0 = full generation (default 0.75)");
  console.log("");
  console.log("Example:");
  console.log('  node scripts/generate-from-reference.mjs ./training-images/valentina/Valentina_1.png "same woman, nude, bedroom mirror selfie, iphone photo, amateur" ./training-images/valentina-nsfw 3 0.7');
  process.exit(1);
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Upload reference image to fal storage
console.log("Uploading reference image...");
const imageBuffer = fs.readFileSync(refImagePath);
const file = new File([imageBuffer], path.basename(refImagePath), { type: "image/png" });
const imageUrl = await fal.storage.upload(file);
console.log("  Uploaded:", imageUrl);

for (let i = 0; i < count; i++) {
  console.log(`\nGenerating image ${i + 1}/${count} (strength: ${strength})...`);

  const result = await fal.subscribe("fal-ai/flux/dev/image-to-image", {
    input: {
      image_url: imageUrl,
      prompt,
      strength,
      num_inference_steps: 28,
      guidance_scale: 3.5,
      num_images: 1,
      enable_safety_checker: false,
    },
  });

  const outputUrl = result.data.images[0].url;
  console.log(`  URL: ${outputUrl}`);

  const res = await fetch(outputUrl);
  const buffer = Buffer.from(await res.arrayBuffer());
  const filename = `img2img_${Date.now()}_${i}.jpg`;
  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, buffer);
  console.log(`  Saved: ${filepath}`);
}

console.log(`\nDone! ${count} images saved to ${outputDir}`);
