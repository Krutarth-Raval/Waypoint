import { prisma } from "./prisma";

export async function generateOtp(email, type) {
  // Generate 6 digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Expire in 10 minutes
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  
  // Invalidate previous OTPs of this type for this email
  await prisma.otp.deleteMany({
    where: { email, type }
  });

  await prisma.otp.create({
    data: { email, code, type, expiresAt }
  });

  return code;
}

export async function verifyOtp(email, code, type) {
  const otp = await prisma.otp.findFirst({
    where: { email, code, type },
    orderBy: { createdAt: 'desc' }
  });

  if (!otp) return false;
  if (otp.expiresAt < new Date()) return false;

  // Delete OTP after successful verification
  await prisma.otp.delete({ where: { id: otp.id } });
  return true;
}
