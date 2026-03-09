import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return new Response("Missing url parameter", { status: 400 });
  }

  // Only allow Replicate delivery URLs
  if (!url.includes("replicate.delivery") && !url.includes("pbxt.replicate.delivery")) {
    return new Response("Invalid image URL", { status: 403 });
  }

  try {
    const imageRes = await fetch(url);
    if (!imageRes.ok) {
      return new Response("Failed to fetch image", { status: 502 });
    }

    const contentType = imageRes.headers.get("content-type") || "image/webp";
    const imageBuffer = await imageRes.arrayBuffer();

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
