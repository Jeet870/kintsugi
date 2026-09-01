"""
Email Service for Kintsugi Platform.
Handles sending real transactional emails via Gmail SMTP (with SSL/STARTTLS authentication)
including OTP verification codes and password change security notifications.
Includes responsive HTML templates matching Kintsugi dark purple design aesthetics.
"""
import smtplib
import logging
from typing import Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.core.config import settings

logger = logging.getLogger("kintsugi.services.email")


class EmailService:
    """
    Transactional Email Service supporting real SMTP dispatch and logger fallback.
    """
    def _send_smtp_email(self, to_email: str, subject: str, html_body: str) -> bool:
        """
        Internal helper to send MIME HTML emails over SMTP.
        """
        if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            logger.info("SMTP credentials missing; fallback to log-only mode.")
            return False

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = settings.SMTP_FROM
            msg["To"] = to_email

            part = MIMEText(html_body, "html")
            msg.attach(part)

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_FROM, [to_email], msg.as_string())

            logger.info(f"Successfully sent SMTP email to {to_email} via {settings.SMTP_HOST}")
            return True
        except Exception as err:
            logger.error(f"Failed to send SMTP email to {to_email}: {err}")
            return False

    def send_forgot_password_otp(self, email: str, otp: str) -> bool:
        """
        Sends OTP verification code email for password recovery.
        """
        subject = "Reset your Kintsugi password"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>{subject}</title>
          <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0D0819; color: #FFFFFF; margin: 0; padding: 20px; }}
            .container {{ max-width: 520px; margin: 0 auto; background-color: #1A1232; border: 1px solid #2E224D; border-radius: 24px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }}
            .header {{ text-align: center; margin-bottom: 24px; }}
            .logo {{ font-size: 28px; font-weight: bold; color: #A855F7; letter-spacing: 1px; }}
            .subtitle {{ color: #C9B8FF; font-size: 14px; margin-top: 4px; }}
            .content {{ font-size: 15px; line-height: 1.6; color: #E2D8FF; text-align: center; }}
            .otp-box {{ background: linear-gradient(135deg, #2E1B4E 0%, #170F2C 100%); border: 2px solid #A855F7; border-radius: 16px; font-size: 36px; font-weight: 800; letter-spacing: 12px; color: #FFFFFF; padding: 20px; margin: 28px 0; text-align: center; display: block; text-shadow: 0 0 10px rgba(168,85,247,0.5); }}
            .footer {{ margin-top: 32px; padding-top: 20px; border-top: 1px solid #2E224D; font-size: 12px; color: #8B88A0; text-align: center; line-height: 1.5; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">✦ Kintsugi</div>
              <div class="subtitle">Mindfulness & Sanctuary</div>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>We received a request to reset your password. Use the verification code below to proceed:</p>
              <div class="otp-box">{otp}</div>
              <p style="font-size: 13px; color: #A855F7;"><strong>This code expires in 10 minutes.</strong></p>
              <p style="font-size: 13px; color: #8B88A0;">If you didn't request this code, you can safely ignore this email. Your password will remain unchanged.</p>
            </div>
            <div class="footer">
              &copy; 2026 Kintsugi AI. All rights reserved.<br>
              End-to-End Encrypted Personal Sanctuary
            </div>
          </div>
        </body>
        </html>
        """
        logger.info(f"========== EMAIL SENT TO: {email} ==========")
        logger.info(f"Subject: {subject}")
        logger.info(f"OTP Code: {otp}")
        logger.info("============================================")

        return self._send_smtp_email(email, subject, html_content)

    def send_password_changed_email(
        self,
        email: str,
        timestamp: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> bool:
        """
        Sends security confirmation notification after password update.
        """
        subject = "Your Kintsugi password was changed"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0D0819; color: #FFFFFF; margin: 0; padding: 20px; }}
            .container {{ max-width: 520px; margin: 0 auto; background-color: #1A1232; border: 1px solid #2E224D; border-radius: 24px; padding: 32px; }}
            .logo {{ font-size: 28px; font-weight: bold; color: #A855F7; text-align: center; }}
            .content {{ font-size: 15px; color: #E2D8FF; margin-top: 20px; line-height: 1.6; }}
            .details {{ background-color: #110B22; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 13px; color: #C9B8FF; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">✦ Kintsugi</div>
            <div class="content">
              <p>Hello,</p>
              <p>Your Kintsugi account password was changed successfully on <strong>{timestamp}</strong>.</p>
              <div class="details">
                <strong>Security Details:</strong><br>
                IP Address: {ip_address or 'Unknown'}<br>
                Device: {user_agent or 'Unknown Device'}
              </div>
              <p style="color: #F87171; font-size: 13px;">If you did not make this change, please contact support immediately to secure your sanctuary account.</p>
            </div>
          </div>
        </body>
        </html>
        """
        logger.info(f"========== SECURITY ALERT SENT TO: {email} ==========")
        logger.info(f"Subject: {subject}")
        logger.info(f"Time: {timestamp} | IP: {ip_address}")
        logger.info("====================================================")

        return self._send_smtp_email(email, subject, html_content)


email_service = EmailService()
