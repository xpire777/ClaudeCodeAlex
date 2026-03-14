import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { getFalRunStatus } from "@/lib/fal";

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

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestId = request.nextUrl.searchParams.get("id");
    if (!requestId) {
      return Response.json({ error: "Missing request ID" }, { status: 400 });
    }

    const result = await getFalRunStatus(requestId);

    if (result.status === "succeeded" && result.imageUrl) {
      console.log("[prediction-status] Image URL:", result.imageUrl);
      return Response.json({
        status: "succeeded",
        imageUrl: `/api/image-proxy?url=${encodeURIComponent(result.imageUrl)}`,
      });
    }

    // Still processing
    return Response.json({ status: "processing" });
  } catch (err) {
    console.error("[prediction-status] Error:", err);
    return Response.json(
      { error: "Failed to check prediction status" },
      { status: 500 }
    );
  }
}
