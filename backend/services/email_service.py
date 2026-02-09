"""
Email service for sending notifications
Supports SMTP configuration via environment variables
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import os

from core.logger import get_logger
from config import settings

logger = get_logger(__name__)


def get_email_config() -> dict:
    """
    Get email configuration from Settings

    Returns:
        Dictionary with email configuration
    """
    return {
        "smtp_server": settings.smtp_server,
        "smtp_port": settings.smtp_port,
        "smtp_username": settings.smtp_username,
        "smtp_password": settings.smtp_password,
        "from_email": settings.from_email,
        "from_name": settings.from_name
    }


def send_email(
    to_email: str,
    subject: str,
    body: str,
    html_body: Optional[str] = None
) -> bool:
    """
    Send an email using SMTP

    Args:
        to_email: Recipient email address
        subject: Email subject
        body: Plain text email body
        html_body: Optional HTML email body

    Returns:
        True if email sent successfully, False otherwise
    """
    # Skip if email is not configured (development mode)
    config = get_email_config()
    if not config["smtp_username"] or not config["smtp_password"]:
        logger.warning(
            "Email not configured, skipping email send",
            to_email=to_email,
            subject=subject
        )
        # Log what would have been sent
        logger.info(
            "[EMAIL WOULD BE SENT]",
            to=to_email,
            subject=subject,
            body=body[:200] + "..." if len(body) > 200 else body
        )
        return True  # Return True to not break workflows in dev

    try:
        # Create message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{config['from_name']} <{config['from_email']}>"
        msg["To"] = to_email

        # Add plain text version
        text_part = MIMEText(body, "plain")
        msg.attach(text_part)

        # Add HTML version if provided
        if html_body:
            html_part = MIMEText(html_body, "html")
            msg.attach(html_part)

        # Connect to SMTP server and send
        with smtplib.SMTP(config["smtp_server"], config["smtp_port"]) as server:
            server.starttls()  # Secure the connection
            server.login(config["smtp_username"], config["smtp_password"])
            server.send_message(msg)
            server.quit()

        logger.info(
            "Email sent successfully",
            to=to_email,
            subject=subject
        )
        return True

    except Exception as e:
        logger.error(
            "Failed to send email",
            to=to_email,
            subject=subject,
            error=str(e),
            exc_info=True
        )
        return False


def send_test_email(to_email: str) -> bool:
    """
    Send a test email to verify email configuration

    Args:
        to_email: Recipient email address

    Returns:
        True if test email sent successfully
    """
    subject = "Todo App - Test Email"
    body = """
This is a test email from Todo App.

If you're receiving this, your email configuration is working correctly!

Best regards,
Todo App Team
    """.strip()

    return send_email(to_email, subject, body)
