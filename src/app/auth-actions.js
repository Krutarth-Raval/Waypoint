"use server";

import { prisma } from "@/lib/prisma";
import { createSession, clearSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { generateOtp, verifyOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/mailer";

// Basic in-memory rate limiter
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

export async function requestAuthOtp(formData) {
  const email = formData.get("email")?.toLowerCase();
  const isSignup = formData.get("isSignup") === "true";
  const name = formData.get("name") || "";

  if (!email) {
    return { error: "Email is required" };
  }

  if (!checkRateLimit(`otp_request_${email}`, 5, 15 * 60 * 1000)) {
    return { error: "Too many requests. Please try again later." };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (isSignup && existingUser) {
    return { error: "Email already in use. Please sign in." };
  }

  if (!isSignup && !existingUser) {
    return { error: "Account not found. Please sign up." };
  }

  const type = isSignup ? "SIGNUP" : "LOGIN";
  const code = await generateOtp(email, type);
  
  try {
    await sendOtpEmail(email, code, type);
  } catch (error) {
    console.error("Failed to send email:", error);
    return { error: "Failed to send verification code. Please try again." };
  }

  return { success: true, redirectUrl: `/login/verify?email=${encodeURIComponent(email)}&isSignup=${isSignup}&name=${encodeURIComponent(name)}` };
}

export async function verifyAuthOtp(formData) {
  const email = formData.get("email");
  const code = formData.get("code");
  const isSignup = formData.get("isSignup") === "true";
  const name = formData.get("name") || "";

  if (!email || !code) {
    return { error: "Email and code are required" };
  }

  const type = isSignup ? "SIGNUP" : "LOGIN";
  const isValid = await verifyOtp(email, code, type);

  if (!isValid) {
    return { error: "Invalid or expired verification code" };
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
    return { error: "Failed to authenticate user" };
  }

  await createSession(user.id);
  return { success: true, redirectUrl: "/" };
}

export async function logout() {
  await clearSession();
  redirect("/login");
}
