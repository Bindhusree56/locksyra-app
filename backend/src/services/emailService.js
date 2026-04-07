const logger = require('../utils/logger');

/**
 * 📧 EMAIL SERVICE (Mock/Console Logger)
 * In production, this would use nodemailer with SMTP (SendGrid, Mailgun, etc.)
 */
const sendEmail = async (options) => {
  const { email, subject, message, html } = options;

  try {
    // For now, we just log to console to avoid external dependencies during setup
    logger.info(`📧 EMAIL SENT TO: ${email}`);
    logger.info(`📝 SUBJECT: ${subject}`);
    logger.info(`📄 MESSAGE: ${message}`);

    if (process.env.NODE_ENV === 'development') {
      console.log('------------------------------------------------------------');
      console.log(`📧 Simulation: Email to ${email}`);
      console.log(`📝 Subject: ${subject}`);
      console.log(`📄 Message: ${message}`);
      if (html) console.log(`🌍 HTML content provided`);
      console.log('------------------------------------------------------------');
    }

    // In production, you'd add:
    // const transporter = nodemailer.createTransport({...});
    // await transporter.sendMail({ from: '"LockSyra" <noreply@locksyra.com>', to: email, subject, text: message, html });

    return true;
  } catch (error) {
    logger.error('❌ Email sending failed:', error);
    return false;
  }
};

/**
 * Send Email Verification Link
 */
const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  
  return sendEmail({
    email,
    subject: '🛡️ Verify your LockSyra account',
    message: `Welcome to LockSyra! Please verify your email by clicking: ${verificationUrl}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
        <h2>Welcome to LockSyra! 🛡️</h2>
        <p>Please click the button below to verify your email address and activate your security dashboard.</p>
        <a href="${verificationUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Verify Email</a>
        <p>If the button doesn't work, copy and paste this link: ${verificationUrl}</p>
      </div>
    `
  });
};

/**
 * Send Password Reset Link
 */
const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  
  return sendEmail({
    email,
    subject: '🔐 Reset your LockSyra Password',
    message: `You requested a password reset. Use this link: ${resetUrl}. It expires in 1 hour.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
        <h2>Password Reset Request 🔐</h2>
        <p>You requested a password reset for your LockSyra account. Click the button below to set a new password.</p>
        <a href="${resetUrl}" style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Reset Password</a>
        <p>This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
      </div>
    `
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail
};
