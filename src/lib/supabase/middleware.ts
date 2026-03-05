import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname;

    // Public routes that don't need staging gate or auth
    const isPublicRoute =
      pathname === "/" ||
      pathname === "/privacy" ||
      pathname === "/terms" ||
      pathname === "/gate" ||
      pathname.startsWith("/api/gate") ||
      pathname.startsWith("/api/waitlist") ||
      pathname.startsWith("/api/auth");

    // Public routes: skip all middleware logic
    if (isPublicRoute) {
      return NextResponse.next();
    }

    // Check staging gate for all non-public routes
    const hasStagingAccess = request.cookies.get("staging_access")?.value === "true";
    if (!hasStagingAccess) {
      const url = request.nextUrl.clone();
      url.pathname = "/gate";
      return NextResponse.redirect(url);
    }

    let supabaseResponse = NextResponse.next({
      request,
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return supabaseResponse;
    }

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Protected app routes - redirect to login if not authenticated
    const isAppRoute =
      pathname.startsWith("/overview") ||
      pathname.startsWith("/discover") ||
      pathname.startsWith("/profile") ||
      pathname.startsWith("/chat") ||
      pathname.startsWith("/chats") ||
      pathname.startsWith("/saved");

    if (isAppRoute && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // Redirect authenticated users away from auth pages
    const isAuthRoute =
      pathname === "/login" || pathname === "/signup";

    if (isAuthRoute && user) {
      const url = request.nextUrl.clone();
      url.pathname = "/overview";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch {
    return NextResponse.next();
  }
}
