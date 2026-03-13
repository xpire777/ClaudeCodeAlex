import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { getComfyRunStatus } from "@/lib/comfydeploy";

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

    const runId = request.nextUrl.searchParams.get("id");
    if (!runId) {
      return Response.json({ error: "Missing run ID" }, { status: 400 });
    }

    const run = await getComfyRunStatus(runId);

    if (run.status === "success") {
      // ComfyDeploy returns outputs as an array of node outputs
      const imageUrl = run.outputs?.[0]?.data?.images?.[0]?.url;
      if (imageUrl) {
        return Response.json({
          status: "succeeded",
          imageUrl: `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`,
        });
      }
      return Response.json({ status: "failed", error: "No output image" });
    }

    if (run.status === "failed" || run.status === "cancelled") {
      return Response.json({
        status: "failed",
        error: "Generation failed",
      });
    }

    // Still processing (queued, running, etc.)
    return Response.json({ status: run.status });
  } catch (err) {
    console.error("[prediction-status] Error:", err);
    return Response.json(
      { error: "Failed to check prediction status" },
      { status: 500 }
    );
  }
}
