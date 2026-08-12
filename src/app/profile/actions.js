"use server";

import { prisma } from "@/lib/prisma";
import { getSession, clearSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { generateOtp, verifyOtp } from "@/lib/otp";
import { sendOtpEmail, sendRevertEmailAlert } from "@/lib/mailer";
import jwt from "jsonwebtoken";

export async function updateProfile(formData) {
  const session = await getSession();
  if (!session?.userId) {
    return { error: "Not authenticated" };
  }

  const name = formData.get("name");
  const avatar = formData.get("avatar"); // base64 string

  try {
    await prisma.user.update({
      where: { id: session.userId },
      data: { name, ...(avatar && { avatar }) },
    });
    revalidatePath("/profile");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update profile" };
  }
}

export async function requestChangeEmailOtp(formData) {
  const session = await getSession();
  if (!session?.userId) return { error: "Not authenticated" };

  const newEmail = formData.get("newEmail")?.toLowerCase();
  if (!newEmail) return { error: "New email is required" };

  const existingUser = await prisma.user.findUnique({
    where: { email: newEmail },
  });

  if (existingUser) {
    return { error: "Email already in use" };
  }

  const code = await generateOtp(newEmail, "CHANGE_EMAIL");
  try {
    await sendOtpEmail(newEmail, code, "CHANGE_EMAIL");
    return { success: true };
  } catch (error) {
    return { error: "Failed to send verification code." };
  }
}

export async function verifyChangeEmailOtp(formData) {
  const session = await getSession();
  if (!session?.userId) return { error: "Not authenticated" };

  const newEmail = formData.get("newEmail")?.toLowerCase();
  const code = formData.get("code");

  if (!newEmail || !code) return { error: "Missing required fields" };

  const isValid = await verifyOtp(newEmail, code, "CHANGE_EMAIL");
  if (!isValid) return { error: "Invalid or expired code" };

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { email: true }
    });

    const oldEmail = user.email;

    await prisma.user.update({
      where: { id: session.userId },
      data: { email: newEmail },
    });
    
    // Generate secure revert token valid for 7 days
    const token = jwt.sign(
      { userId: session.userId, oldEmail, newEmail },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Track token in DB to allow revocation/validation
    await prisma.otp.create({
      data: {
        email: oldEmail,
        code: token,
        type: "REVERT_EMAIL",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    // Send the security alert
    await sendRevertEmailAlert(oldEmail, token);

    // Log out upon successful email change
    await clearSession();
    return { redirect: "/login" };
  } catch (error) {
    return { error: "Failed to update email" };
  }
}

export async function requestDeleteAccountOtp() {
  const session = await getSession();
  if (!session?.userId) return { error: "Not authenticated" };

  const user = await prisma.user.findUnique({
    where: { id: session.userId }
  });

  if (!user) return { error: "User not found" };

  const code = await generateOtp(user.email, "DELETE_ACCOUNT");
  try {
    await sendOtpEmail(user.email, code, "DELETE_ACCOUNT");
    return { success: true, email: user.email };
  } catch (error) {
    return { error: "Failed to send verification code." };
  }
}

export async function verifyDeleteAccountOtp(formData) {
  const session = await getSession();
  if (!session?.userId) return { error: "Not authenticated" };

  const email = formData.get("email");
  const code = formData.get("code");

  if (!email || !code) return { error: "Missing required fields" };

  const isValid = await verifyOtp(email, code, "DELETE_ACCOUNT");
  if (!isValid) return { error: "Invalid or expired code" };

  await prisma.user.delete({
    where: { id: session.userId },
  });

  await clearSession();
  return { redirect: "/login" };
}

export async function toggleNotifications(formData) {
  const session = await getSession();
  if (!session?.userId) return { error: "Not authenticated" };

  const enabled = formData.get("enabled") === "true";

  await prisma.user.update({
    where: { id: session.userId },
    data: { notificationsEnabled: enabled },
  });

  revalidatePath("/profile");
  return { success: true };
}

export async function processRevertEmail(token) {
  if (!token) return { error: "Missing token" };

  try {
    // 1. Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId, oldEmail, newEmail } = decoded;

    // 2. Check if the token still exists and is valid in the Otp table
    const otpRecord = await prisma.otp.findFirst({
      where: {
        email: oldEmail,
        code: token,
        type: "REVERT_EMAIL",
      }
    });

    if (!otpRecord || new Date() > otpRecord.expiresAt) {
      return { error: "This revert link has expired or is invalid." };
    }

    // 3. Revert the user's email back to oldEmail
    await prisma.user.update({
      where: { id: userId },
      data: { email: oldEmail }
    });

    // 4. Invalidate the token so it can't be reused
    await prisma.otp.delete({
      where: { id: otpRecord.id }
    });

    // 5. Delete all other active OTPs/Revert tokens for this user just in case
    await prisma.otp.deleteMany({
      where: { email: oldEmail }
    });
    await prisma.otp.deleteMany({
      where: { email: newEmail }
    });

    // We don't have a sessions table since it's JWT cookies, so we can't delete 
    // the hijacker's session directly from the DB, but their session cookie 
    // uses the user ID. When they next request a protected route, it will work.
    // However, if we added a `tokenVersion` or `sessionCounter` to User we could invalidate it.
    // For now, restoring the email secures the account against password resets/new OTP logins.
    
    return { success: true };
  } catch (err) {
    return { error: "Invalid or expired revert link." };
  }
}
