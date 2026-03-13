import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { imageUrl, messageId } = await request.json();
    if (!imageUrl || !messageId) {
      return Response.json({ error: "Missing imageUrl or messageId" }, { status: 400 });
    }

    // Fetch the image from the proxy/S3 URL
    const fullUrl = imageUrl.startsWith("/") ? `${request.nextUrl.origin}${imageUrl}` : imageUrl;
    const imageRes = await fetch(fullUrl);
    if (!imageRes.ok) {
      return Response.json({ error: "Failed to fetch image" }, { status: 502 });
    }

    const imageBuffer = await imageRes.arrayBuffer();
    const contentType = imageRes.headers.get("content-type") || "image/png";
    const ext = contentType.includes("webp") ? "webp" : "png";
    const filename = `${user.id}/${messageId}.${ext}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("chat-images")
      .upload(filename, imageBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error("[persist-image] Upload error:", uploadError);
      return Response.json({ error: "Failed to upload image" }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("chat-images")
      .getPublicUrl(filename);

    // Update message record
    await supabase
      .from("messages")
      .update({ image_url: publicUrl })
      .eq("id", messageId);

    return Response.json({ permanentUrl: publicUrl });
  } catch (err) {
    console.error("[persist-image] Error:", err);
    return Response.json({ error: "Failed to persist image" }, { status: 500 });
  }
}
