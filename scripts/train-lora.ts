/**
 * Train a Flux LoRA on Replicate for a persona.
 *
 * Usage:
 *   npx tsx scripts/train-lora.ts valentina
 */

import Replicate from "replicate";
import { fal } from "@fal-ai/client";
import { createReadStream, createWriteStream, readFileSync } from "fs";
import { readdir, stat } from "fs/promises";
import path from "path";
import { createGzip } from "zlib";
import { pack } from "tar-stream";

const REPLICATE_OWNER = "xpire777";

async function createTarGz(imageDir: string, outputPath: string): Promise<void> {
  const files = await readdir(imageDir);
  const imageFiles = files.filter((f) =>
    /\.(png|jpg|jpeg|webp)$/i.test(f)
  );

  if (imageFiles.length === 0) {
    throw new Error(`No images found in ${imageDir}`);
  }

  console.log(`Packing ${imageFiles.length} images from ${imageDir}...`);

  return new Promise((resolve, reject) => {
    const tarPack = pack();
    const gzip = createGzip();
    const output = createWriteStream(outputPath);

    tarPack.pipe(gzip).pipe(output);

    output.on("finish", resolve);
    output.on("error", reject);

    (async () => {
      for (const file of imageFiles) {
        const filePath = path.join(imageDir, file);
        const fileStat = await stat(filePath);
        const entry = tarPack.entry({
          name: file,
          size: fileStat.size,
        });

        const stream = createReadStream(filePath);
        await new Promise<void>((res, rej) => {
          stream.pipe(entry);
          entry.on("finish", res);
          entry.on("error", rej);
        });
      }
      tarPack.finalize();
    })().catch(reject);
  });
}

async function main() {
  const personaSlug = process.argv[2];
  if (!personaSlug) {
    console.error("Usage: npx tsx scripts/train-lora.ts <persona-slug>");
    process.exit(1);
  }

  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    console.error("Missing REPLICATE_API_TOKEN in environment");
    process.exit(1);
  }

  const imageDir = path.resolve(`training-images/${personaSlug}`);
  const tarPath = path.resolve(`training-images/${personaSlug}.tar.gz`);

  // Pack images into tar.gz
  await createTarGz(imageDir, tarPath);
  console.log(`Created archive: ${tarPath}`);

  const replicate = new Replicate({ auth: token });

  // Create the model destination on Replicate
  const modelName = `cabn-${personaSlug}`;
  console.log(`Creating model ${REPLICATE_OWNER}/${modelName}...`);

  try {
    await replicate.models.create(REPLICATE_OWNER, modelName, {
      visibility: "private",
      hardware: "gpu-t4",
      description: `CABN persona LoRA for ${personaSlug}`,
    });
    console.log("Model created.");
  } catch (err: unknown) {
    const error = err as { response?: { status?: number } };
    if (error.response?.status === 409 || error.response?.status === 500) {
      console.log("Model may already exist, continuing with training...");
    } else {
      throw err;
    }
  }

  // Upload the tar.gz to fal.ai storage (no size limit) to get a public URL
  console.log("Uploading training images to fal.ai storage...");
  fal.config({ credentials: process.env.FAL_KEY });
  const tarBuffer = readFileSync(tarPath);
  const tarFile = new File([tarBuffer], `${personaSlug}-training.tar.gz`, { type: "application/gzip" });
  const uploadedUrl = await fal.storage.upload(tarFile);
  console.log(`  Uploaded: ${uploadedUrl}`);

  // Start training using Flux LoRA trainer
  console.log("Starting LoRA training...");

  const training = await replicate.trainings.create(
    "ostris",
    "flux-dev-lora-trainer",
    "26dce37af90b9d997eeb970d92e47de3064d46c300504ae376c75bef6a9022d2",
    {
      destination: `${REPLICATE_OWNER}/${modelName}`,
      input: {
        input_images: uploadedUrl,
        trigger_word: personaSlug.toUpperCase(),
        steps: 1000,
        learning_rate: 0.0004,
        batch_size: 1,
        resolution: "512,768,1024",
        autocaption: true,
        autocaption_prefix: `a photo of ${personaSlug.toUpperCase()},`,
      },
    }
  );

  console.log(`\nTraining started!`);
  console.log(`Training ID: ${training.id}`);
  console.log(`Status: ${training.status}`);
  console.log(`\nTrack progress at: https://replicate.com/p/${training.id}`);
  console.log(`\nOnce complete, the model will be at:`);
  console.log(`https://replicate.com/${REPLICATE_OWNER}/${modelName}`);
  console.log(`\nSave this model path in your personas data:`);
  console.log(`${REPLICATE_OWNER}/${modelName}`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
