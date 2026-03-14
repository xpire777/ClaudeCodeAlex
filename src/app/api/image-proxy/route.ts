import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return new Response("Missing url parameter", { status: 400 });
  }

  // Only allow known image delivery URLs
  const allowedHosts = [
    "replicate.delivery",
    "pbxt.replicate.delivery",
    "comfy-deploy-output.s3",
    "fal.media",
    "v3.fal.media",
  ];
  if (!allowedHosts.some((host) => url.includes(host))) {
    return new Response("Invalid image URL", { status: 403 });
  }

  try {
    console.log("[image-proxy] Fetching:", url);
    const imageRes = await fetch(url);
    if (!imageRes.ok) {
      console.error("[image-proxy] Fetch failed:", imageRes.status, imageRes.statusText);
      return new Response("Failed to fetch image", { status: 502 });
    }

    const contentType = imageRes.headers.get("content-type") || "image/webp";
    const imageBuffer = await imageRes.arrayBuffer();
    const sizeMB = (imageBuffer.byteLength / (1024 * 1024)).toFixed(2);
    console.log(`[image-proxy] Image size: ${imageBuffer.byteLength} bytes (${sizeMB} MB), type: ${contentType}`);

    return new Response(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch {
    return new Response("Failed to proxy image", { status: 502 });
  }
}
