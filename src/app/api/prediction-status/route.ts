import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { replicate } from "@/lib/replicate";

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

    const predictionId = request.nextUrl.searchParams.get("id");
    if (!predictionId) {
      return Response.json({ error: "Missing prediction ID" }, { status: 400 });
    }

    const prediction = await replicate.predictions.get(predictionId);

    if (prediction.status === "succeeded") {
      const output = prediction.output as string[];
      const imageUrl = output?.[0];
      if (imageUrl) {
        return Response.json({ status: "succeeded", imageUrl });
      }
      return Response.json({ status: "failed", error: "No output" });
    }

    if (prediction.status === "failed" || prediction.status === "canceled") {
      return Response.json({
        status: "failed",
        error: prediction.error || "Generation failed",
      });
    }

    // Still processing
    return Response.json({ status: prediction.status });
  } catch (err) {
    console.error("[prediction-status] Error:", err);
    return Response.json(
      { error: "Failed to check prediction status" },
      { status: 500 }
    );
  }
}
