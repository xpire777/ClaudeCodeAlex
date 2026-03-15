import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
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

    // Send welcome email
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "CABN <hello@cabn.io>",
          to: email,
          subject: "You're on the CABN waitlist",
          html: `
            <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 520px; margin: 0 auto; padding: 40px 20px; color: #322D29;">
              <h1 style="font-size: 32px; letter-spacing: 0.3em; text-align: center; margin-bottom: 24px;">CABN</h1>
              <p style="font-size: 16px; line-height: 1.7; color: #AC9C8D;">Hey there,</p>
              <p style="font-size: 16px; line-height: 1.7; color: #AC9C8D;">
                Thanks for joining the CABN waitlist. You're in -we'll let you know as soon as we're ready for you.
              </p>
              <p style="font-size: 16px; line-height: 1.7; color: #AC9C8D;">
                CABN is a new kind of connection. Curated personas that are always there when you need them -ready to chat, share their day, and build something real with you.
              </p>
              <p style="font-size: 16px; line-height: 1.7; color: #AC9C8D;">
                We're putting the finishing touches on things. Sit tight.
              </p>
              <p style="font-size: 14px; color: #AC9C8D; margin-top: 32px; text-align: center; border-top: 1px solid #EFE9E1; padding-top: 20px;">
                The CABN Team
              </p>
            </div>
          `,
        });
        console.log("[waitlist] Welcome email sent to:", email);
      } catch (emailErr) {
        console.error("[waitlist] Failed to send welcome email:", emailErr);
        // Don't fail the signup if email fails
      }
    }

    return NextResponse.json({ message: "You're on the list!" });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
