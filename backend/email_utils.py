import os
import resend
import logging
from dotenv import load_dotenv

load_dotenv()
resend.api_key = os.getenv("RESEND_API_KEY")

FRONTEND_URL = os.getenv("FRONTEND_URL")

ADMIN_RECEIVING_EMAIL = os.getenv("SENDER_EMAIL") 
RESEND_FROM_EMAIL = "GABAY System <onboarding@resend.dev>"

logger = logging.getLogger(__name__)

# ==========================================
# EMAIL VERIFICATION FUNCTION
# ==========================================
def send_verification_email(recipient_email: str, token: str):
    if not resend.api_key:
        logger.error("Failed to send email: Missing RESEND_API_KEY in environment variables.")
        return

    try:
        verification_link = f"{FRONTEND_URL}/verify-email?token={token}"
        
        html_body = f"""
        <h2>Welcome to the GABAY System!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <p><a href="{verification_link}">{verification_link}</a></p>
        <br>
        <p><em>This link is valid for 12 hours.</em></p>
        """

        response = resend.Emails.send({
            "from": RESEND_FROM_EMAIL,
            "to": recipient_email,
            "subject": "GABAY System: Verify Your Email Address",
            "html": html_body
        })
        logger.info(f"Verification email sent to {recipient_email}. Response: {response}")

    except Exception as e:
        print(f"FAILED TO SEND EMAIL: {e}")
        logger.error(f"Failed to send verification email to {recipient_email}. Error: {e}")

# ==========================================
# EMAIL OTP FUNCTION
# ==========================================
def send_otp_email(recipient_email: str, otp: str):
    if not resend.api_key:
        logger.error("Failed to send OTP: Missing RESEND_API_KEY.")
        return

    try:
        html_body = f"""
        <p>Hello,</p>
        <p>We received a request to reset the password for your GABAY System account.</p>
        <h3>Your One-Time Password (OTP) is: <strong>{otp}</strong></h3>
        <p>This code is valid for a short time. Please enter it on the website to reset your password.</p>
        <br>
        <p><small>If you did not request a password reset, please ignore this email.</small></p>
        """

        response = resend.Emails.send({
            "from": RESEND_FROM_EMAIL,
            "to": recipient_email,
            "subject": "GABAY System: Password Reset OTP",
            "html": html_body
        })
        logger.info(f"OTP email sent to {recipient_email}. Response: {response}")

    except Exception as e:
        print(f"FAILED TO SEND EMAIL: {e}")
        logger.error(f"Failed to send OTP email to {recipient_email}. Error: {e}")

# ==========================================
# EMAIL NOTIFICATION EMAIL
# ==========================================
def send_notification_email(recipient_email: str, subject: str, body: str):
    if not resend.api_key:
        print("Error: RESEND_API_KEY is missing from the .env file.")
        return

    try:
        formatted_body = body.replace('\n', '<br>')
        html_body = f"<p>{formatted_body}</p>"

        response = resend.Emails.send({
            "from": RESEND_FROM_EMAIL,
            "to": recipient_email,
            "subject": subject,
            "html": html_body
        })
        print(f"Successfully sent background email to {recipient_email}. Response: {response}")
        
    except Exception as e:
        print(f"Failed to send email: {e}")

# ==========================================
# CONTACT US EMAIL FUNCTION
# ==========================================
def send_contact_us_email(name: str, user_email: str, subject: str, message: str):
    """Forwards a Contact Us form submission to the hospital's admin email."""
    if not resend.api_key:
        logger.error("Failed to send Contact Us email: Missing RESEND_API_KEY.")
        return

    try:
        email_subject = f"New GABAY Inquiry: {subject}"
        formatted_message = message.replace('\n', '<br>')
        
        html_body = f"""
        <h3>New Contact Form Submission</h3>
        <p><strong>From:</strong> {name}</p>
        <p><strong>Email:</strong> {user_email}</p>
        <p><strong>Subject:</strong> {subject}</p>
        <hr>
        <p><strong>Message:</strong></p>
        <p>{formatted_message}</p>
        """

        response = resend.Emails.send({
            "from": RESEND_FROM_EMAIL,
            "to": ADMIN_RECEIVING_EMAIL,
            "subject": email_subject,
            "reply_to": user_email,
            "html": html_body
        })
        logger.info(f"Contact Us email forwarded to admin. Response: {response}")

    except Exception as e:
        print(f"FAILED TO SEND EMAIL: {e}")
        logger.error(f"Failed to process Contact Us form from {user_email}. Error: {e}")