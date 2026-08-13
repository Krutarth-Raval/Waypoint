import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function sendOtpEmail(to, otp, type, magicLink = null) {
  const subjects = {
    LOGIN: 'Your Waypoint Login Code',
    SIGNUP: 'Your Waypoint Verification Code',
    CHANGE_EMAIL: 'Your Waypoint Email Change Code',
    DELETE_ACCOUNT: 'Your Waypoint Account Deletion Code'
  };

  const subject = subjects[type] || 'Your Waypoint OTP';
  
  const magicLinkHtml = magicLink ? `
    <div style="margin-top: 24px;">
      <a href="${magicLink}" style="display: inline-block; background-color: #10b981; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 16px;">
        Log In Automatically
      </a>
    </div>
    <p style="color: #94a3b8; font-size: 14px; text-align: center; margin-top: 16px;">Or manually enter the code below:</p>
  ` : '';

  await transporter.sendMail({
    from: `"Waypoint" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: `
      <div style="font-family: 'Inter', sans-serif; max-w: 600px; margin: 0 auto; padding: 32px; border: 1px solid #1e293b; border-radius: 16px; background-color: #020817; color: #f8fafc;">
        <h2 style="color: #10b981; margin-top: 0; font-size: 24px; text-align: center;">${subject}</h2>
        <p style="color: #94a3b8; font-size: 16px; text-align: center;">Here is your secure verification code. It expires in 10 minutes.</p>
        <div style="background-color: #0f172a; padding: 24px; border-radius: 12px; text-align: center; margin: 32px 0; border: 1px solid #1e293b;">
          ${magicLinkHtml}
          <span style="font-size: 40px; font-weight: bold; letter-spacing: 8px; color: #f8fafc;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 14px; text-align: center; margin-bottom: 0;">If you didn't request this code, you can safely ignore this email.</p>
      </div>
    `
  });
}

export async function sendRevertEmailAlert(oldEmail, token) {
  const revertLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/revert-email?token=${token}`;

  await transporter.sendMail({
    from: `"Waypoint Security" <${process.env.EMAIL_USER}>`,
    to: oldEmail,
    subject: 'Security Alert: Your Waypoint Email Was Changed',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-w: 600px; margin: 0 auto; padding: 32px; border: 1px solid #1e293b; border-radius: 16px; background-color: #020817; color: #f8fafc;">
        <h2 style="color: #ef4444; margin-top: 0; font-size: 24px; text-align: center;">Security Alert</h2>
        <p style="color: #94a3b8; font-size: 16px; text-align: center;">
          The email address associated with your Waypoint account was just changed.
        </p>
        <div style="background-color: #0f172a; padding: 24px; border-radius: 12px; text-align: center; margin: 32px 0; border: 1px solid #1e293b;">
          <p style="color: #f8fafc; font-size: 16px; margin-bottom: 24px;">
            If you did not authorize this change, please click the button below immediately to secure your account and revert your email address. This link is valid for 7 days.
          </p>
          <a href="${revertLink}" style="display: inline-block; background-color: #ef4444; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Revert Email Change
          </a>
        </div>
        <p style="color: #64748b; font-size: 14px; text-align: center; margin-bottom: 0;">If you made this change, you can safely ignore this email.</p>
      </div>
    `
  });
}
