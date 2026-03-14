import { fal } from "@fal-ai/client";
import fs from "fs";
import path from "path";

fal.config({
  credentials: process.env.FAL_KEY,
});

const prompt = process.argv[2];
const outputDir = process.argv[3] || "./generated-images";
const count = parseInt(process.argv[4] || "1", 10);

if (!prompt) {
  console.log("Usage: node scripts/generate-training-images.mjs <prompt> [output-dir] [count]");
  console.log("");
  console.log("Examples:");
  console.log('  node scripts/generate-training-images.mjs "young woman, platinum blonde bob, full body, bedroom, natural lighting" ./training-images/hannah-nsfw 5');
  console.log('  node scripts/generate-training-images.mjs "young latina woman, long wavy dark hair, mirror selfie, lingerie" ./training-images/lisa-nsfw 3');
  process.exit(1);
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

for (let i = 0; i < count; i++) {
  console.log(`Generating image ${i + 1}/${count}...`);

  const result = await fal.subscribe("fal-ai/flux/dev", {
    input: {
      prompt,
      image_size: { width: 768, height: 1024 },
      num_inference_steps: 28,
      guidance_scale: 3.5,
      num_images: 1,
      enable_safety_checker: false,
    },
  });

  const imageUrl = result.data.images[0].url;
  console.log(`  URL: ${imageUrl}`);

  const res = await fetch(imageUrl);
  const buffer = Buffer.from(await res.arrayBuffer());
  const filename = `image_${Date.now()}_${i}.jpg`;
  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, buffer);
  console.log(`  Saved: ${filepath}`);
}

console.log(`\nDone! ${count} images saved to ${outputDir}`);
