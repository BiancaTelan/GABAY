import os
import requests
import logging
from dotenv import load_dotenv

load_dotenv()

BREVO_API_KEY = os.getenv("BREVO_API_KEY")
FRONTEND_URL = os.getenv("FRONTEND_URL")

SENDER_EMAIL = os.getenv("SENDER_EMAIL") 
ADMIN_RECEIVING_EMAIL = SENDER_EMAIL

logger = logging.getLogger(__name__)

def send_brevo_email(to_email: str, subject: str, html_content: str, reply_to: str = None):
    """Helper function to send emails via Brevo's HTTP API."""
    if not BREVO_API_KEY:
        logger.error("Failed to send email: Missing BREVO_API_KEY.")
        return

    url = "https://api.brevo.com/v3/smtp/email"
    
    headers = {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json"
    }
    
    payload = {
        "sender": {"name": "GABAY System", "email": SENDER_EMAIL},
        "to": [{"email": to_email}],
        "subject": subject,
        "htmlContent": html_content
    }

    if reply_to:
        payload["replyTo"] = {"email": reply_to}

    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        logger.info(f"Email successfully sent to {to_email}")
    except requests.exceptions.RequestException as e:
        print(f"FAILED TO SEND EMAIL via Brevo: {e}")
        logger.error(f"Failed to send email to {to_email}. Error: {e}")


# ==========================================
# EMAIL VERIFICATION FUNCTION
# ==========================================
def send_verification_email(recipient_email: str, token: str):
    verification_link = f"{FRONTEND_URL}/verify-email?token={token}"
    
    html_body = f"""
    <h2>Welcome to the GABAY System!</h2>
    <p>Please verify your email address by clicking the link below:</p>
    <p><a href="{verification_link}">{verification_link}</a></p>
    <br>
    <p><em>This link is valid for 12 hours.</em></p>
    """
    
    send_brevo_email(recipient_email, "GABAY System: Verify Your Email Address", html_body)

# ==========================================
# EMAIL OTP FUNCTION
# ==========================================
def send_otp_email(recipient_email: str, otp: str):
    html_body = f"""
    <p>Hello,</p>
    <p>We received a request to reset the password for your GABAY System account.</p>
    <h3>Your One-Time Password (OTP) is: <strong>{otp}</strong></h3>
    <p>This code is valid for a short time. Please enter it on the website to reset your password.</p>
    <br>
    <p><small>If you did not request a password reset, please ignore this email.</small></p>
    """
    
    send_brevo_email(recipient_email, "GABAY System: Password Reset OTP", html_body)

# ==========================================
# EMAIL NOTIFICATION EMAIL (Appointments)
# ==========================================
def send_notification_email(recipient_email: str, subject: str, body: str):
    formatted_body = body.replace('\n', '<br>')
    html_body = f"<p>{formatted_body}</p>"
    
    send_brevo_email(recipient_email, subject, html_body)

# ==========================================
# CONTACT US EMAIL FUNCTION
# ==========================================
def send_contact_us_email(name: str, user_email: str, subject: str, message: str):
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
    
    send_brevo_email(ADMIN_RECEIVING_EMAIL, email_subject, html_body, reply_to=user_email)

# ==========================================
# PERSONNEL CREDENTIALS EMAIL FUNCTION
# ==========================================
def send_personnel_credentials_email(recipient_email: str, name: str, role: str, raw_password: str):

    brevo_api_key = os.getenv("BREVO_API_KEY")
    if not brevo_api_key:
        print("❌ ERROR: BREVO_API_KEY is missing from your .env file!")
        return

    subject = f"Welcome to GABAY - Your {role} Account Credentials"
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #0b3b60; text-align: center;">Welcome to GABAY</h2>
        <p>Hello <strong>{name}</strong>,</p>
        <p>An administrator has created a new GABAY <strong>{role}</strong> account for you. You can now log into the Administrative Portal using the credentials below:</p>
        
        <div style="background-color: #f4f6f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Email:</strong> {recipient_email}</p>
            <p style="margin: 0;"><strong>Temporary Password:</strong> <span style="font-family: monospace; letter-spacing: 1px;">{raw_password}</span></p>
        </div>
        
        <p style="color: #d9534f; font-size: 14px;"><em><strong>Important:</strong> For security purposes, please log in and change your password immediately via your account settings.</em></p>
        
        <br>
        <p style="font-size: 14px; color: #666;">Thank you,<br>GABAY System Administration</p>
    </div>
    """

    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept": "application/json",
        "api-key": brevo_api_key,
        "content-type": "application/json"
    }
    
    payload = {
        "sender": {
            "name": "GABAY Admin System",
            "email": "gabay.system@gmail.com"
        },
        "to": [
            {
                "email": recipient_email,
                "name": name
            }
        ],
        "subject": subject,
        "htmlContent": html_content
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        
        if response.status_code == 201:
            print(f"✅ SUCCESS: Credentials email sent to {recipient_email} via Brevo")
        else:
            print(f"❌ BREVO ERROR: Failed to send email. Status Code: {response.status_code}")
            print(response.json())
            
    except Exception as e:
        print(f"❌ CRITICAL ERROR: Could not connect to Brevo. {str(e)}")