import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { password } = await request.json();
  const stagingPassword = process.env.STAGING_PASSWORD;

  if (!stagingPassword) {
    return NextResponse.json(
      { error: "STAGING_PASSWORD not configured" },
      { status: 500 }
    );
  }

  if (password !== stagingPassword) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("staging_access", "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });

  return response;
}
