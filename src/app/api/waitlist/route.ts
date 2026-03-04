import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("your-supabase")) {
      // Supabase not configured yet — log to console and return success
      console.log(`[waitlist] Email collected (no Supabase): ${email}`);
      return NextResponse.json({ message: "You're on the list!" });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase.from("waitlist").insert({ email });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ message: "You're already on the list!" });
      }
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "You're on the list!" });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
