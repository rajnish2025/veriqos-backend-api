import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

function registrationOtpTemplate(otp) {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Email Verification</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, sans-serif;
          background-color: #f5f7fa;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 500px;
          background-color: #ffffff;
          margin: 40px auto;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        .logo {
          text-align: center;
          margin-bottom: 20px;
        }
        .otp {
          font-size: 28px;
          font-weight: bold;
          color: #2563eb;
          letter-spacing: 4px;
          text-align: center;
          margin: 20px 0;
        }
        .btn {
          display: block;
          width: 200px;
          margin: 25px auto;
          padding: 12px;
          background-color: #2563eb;
          color: #ffffff;
          text-align: center;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 500;
        }
        .footer {
          text-align: center;
          color: #888;
          font-size: 12px;
          margin-top: 30px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <img src="https://upload.wikimedia.org/wikipedia/commons/a/ab/Logo_TV_2015.png" alt="Logo" width="100" />
        </div>
        <h2 style="text-align:center;color:#111827;">Welcome to Veriqos Technologies</h2>
        <p style="text-align:center;color:#374151;">
          Thank you for registering. Use the OTP below to verify your email address:
        </p>
        <div class="otp">${otp}</div>
        <p style="text-align:center;color:#6b7280;">This OTP is valid for <b>10 minutes</b>.</p>
        <div class="footer">
          If you didn’t sign up for this account, you can safely ignore this email.<br>
          &copy; 2025 Your Company. All rights reserved.
        </div>
      </div>
    </body>
  </html>
  `;
}

function passwordResetOTPTemplate(otp) {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Password Reset OTP</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, sans-serif;
          background-color: #f8fafc;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 500px;
          background-color: #ffffff;
          margin: 40px auto;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.08);
        }
        .logo {
          text-align: center;
          margin-bottom: 20px;
        }
        .otp {
          font-size: 28px;
          font-weight: bold;
          color: #dc2626;
          letter-spacing: 4px;
          text-align: center;
          margin: 20px 0;
        }
        .btn {
          display: block;
          width: 200px;
          margin: 25px auto;
          padding: 12px;
          background-color: #dc2626;
          color: #ffffff;
          text-align: center;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 500;
        }
        .footer {
          text-align: center;
          color: #888;
          font-size: 12px;
          margin-top: 30px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <img src="https://upload.wikimedia.org/wikipedia/commons/a/ab/Logo_TV_2015.png" alt="Logo" width="100" />
        </div>
        <h2 style="text-align:center;color:#111827;">Password Reset Request</h2>
        <p style="text-align:center;color:#374151;">
          You requested to reset your password. Use the OTP below to continue:
        </p>
        <div class="otp">${otp}</div>
        <p style="text-align:center;color:#6b7280;">This OTP will expire in <b>10 minutes</b>.</p>
        <div class="footer">
          If you didn’t request a password reset, please ignore this email.<br>
          &copy; 2025 Your Company. All rights reserved.
        </div>
      </div>
    </body>
  </html>
  `;
}

function resetPasswordTemplate(resetLink) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Reset Your Password</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, sans-serif;
        background-color: #f5f7fa;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 500px;
        background-color: #ffffff;
        margin: 40px auto;
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      }
      .logo {
        text-align: center;
        margin-bottom: 20px;
      }
      .btn {
        display: block;
        width: 220px;
        margin: 25px auto;
        padding: 12px;
        background-color: #2563eb;
        color: #ffffff;
        text-align: center;
        border-radius: 6px;
        text-decoration: none;
        font-weight: 500;
      }
      .footer {
        text-align: center;
        color: #888;
        font-size: 12px;
        margin-top: 30px;
      }
      .btn{
        color:white;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo">
        <img src="https://upload.wikimedia.org/wikipedia/commons/a/ab/Logo_TV_2015.png" alt="Logo" width="100" />
      </div>
      <h2 style="text-align:center;color:#111827;">Reset Your Password</h2>
      <p style="text-align:center;color:#374151;">
        You recently requested to reset your password. Click the button below to create a new one.
      </p>
      <a href="${resetLink}" class="btn">Reset Password</a>
      <p style="text-align:center;color:#6b7280;">
        If you did not request a password reset, please ignore this email.
      </p>
      <div class="footer">
        This link will expire in <b>15 minutes</b>.<br>
        &copy; 2025 Your Company. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
}

async function sendVerificationOTP(toEmail, otp) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: toEmail,
      subject: "Verify Your Account - OTP Code",
      html: registrationOtpTemplate(otp),
    });
    console.log("Verification OTP email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("Error sending verification email:", err);
  }
}

async function sendPasswordResetOTP(toEmail, otp) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: toEmail,
      subject: "Password Reset OTP Verification",
      html: passwordResetOTPTemplate(otp),
    });
    console.log("OTP mail sent successfully:", info.messageId);
    return info;
  } catch (err) {
    console.error("Error sending mail:", err);
  }
}

async function sendResetPasswordLinkEmail(toEmail, resetLink) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: toEmail,
      subject: "Reset Your Password - Secure Link",
      html: resetPasswordTemplate(resetLink),
    });

    console.log("Reset Password email sent:", info.messageId);
  } catch (err) {
    console.error("Error sending reset password email:", err);
  }
}

export {
  sendPasswordResetOTP,
  sendVerificationOTP,
  sendResetPasswordLinkEmail,
};
