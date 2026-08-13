import { prisma } from "@/lib/prisma";
import { generateOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/mailer";
import { NextResponse } from "next/server";

const rateLimitCache = new Map();

function checkRateLimit(key, maxRequests = 5, windowMs = 60000) {
  const now = Date.now();
  const userCache = rateLimitCache.get(key) || { count: 0, startTime: now };
  
  if (now - userCache.startTime > windowMs) {
    userCache.count = 1;
    userCache.startTime = now;
  } else {
    userCache.count++;
  }
  
  rateLimitCache.set(key, userCache);
  return userCache.count <= maxRequests;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const email = body.email?.toLowerCase();
    const isSignup = body.isSignup === true;
    const name = body.name || "";

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!checkRateLimit(`api_otp_request_${email}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (isSignup && existingUser) {
      return NextResponse.json({ error: "Email already in use. Please sign in." }, { status: 400 });
    }

    if (!isSignup && !existingUser) {
      return NextResponse.json({ error: "Account not found. Please sign up." }, { status: 400 });
    }

    const type = isSignup ? "SIGNUP" : "LOGIN";
    const code = await generateOtp(email, type);
    
    let magicLink = null;
    if (body.source === 'mobile') {
      magicLink = `exp://10.174.133.178:8081/--/login/verify?code=${code}&email=${encodeURIComponent(email)}`;
    }
    
    await sendOtpEmail(email, code, type, magicLink);

    return NextResponse.json({ success: true, message: "OTP sent" });
  } catch (error) {
    console.error("API Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
