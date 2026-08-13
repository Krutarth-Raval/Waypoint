import { prisma } from "@/lib/prisma";
import { verifyOtp } from "@/lib/otp";
import { createSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = body.email;
    const code = body.code;
    const isSignup = body.isSignup === true;
    const name = body.name || "";

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
    }

    const type = isSignup ? "SIGNUP" : "LOGIN";
    const isValid = await verifyOtp(email, code, type);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 401 });
    }

    let user;

    if (isSignup) {
      user = await prisma.user.create({
        data: {
          email,
          name,
        },
      });
    } else {
      user = await prisma.user.findUnique({
        where: { email },
      });
    }

    if (!user) {
      return NextResponse.json({ error: "Failed to authenticate user" }, { status: 500 });
    }

    await createSession(user.id);
    
    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error("API Verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
