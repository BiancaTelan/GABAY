import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()
SENDER_EMAIL = os.getenv("SENDER_EMAIL")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

logger = logging.getLogger(__name__)

def send_verification_email(recipient_email: str, token: str):
    if not SENDER_EMAIL or not SENDER_PASSWORD:
        logger.error("Failed to send email: Missing SMTP credentials in environment variables.")
        return

    try:
        subject = "GABAY System: Verify Your Email Address"
        verification_link = f"{FRONTEND_URL}/verify-email?token={token}"
        
        body = f"""Welcome to the GABAY System!
        
Please verify your email address by clicking the link below:
{verification_link}
        
This link is valid for 12 hours."""

        msg = MIMEMultipart()
        msg['From'] = SENDER_EMAIL
        msg['To'] = recipient_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls() 
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.sendmail(SENDER_EMAIL, recipient_email, msg.as_string())
        server.quit()

    except Exception as e:
        logger.error(f"Failed to send verification email to {recipient_email}. Error: {e}")


def send_otp_email(recipient_email: str, otp: str):
    if not SENDER_EMAIL or not SENDER_PASSWORD:
        logger.error("Failed to send OTP: Missing SMTP credentials in environment variables.")
        return

    try:
        subject = "GABAY System: Password Reset OTP"
        body = f"""Hello,
        
We received a request to reset the password for your GABAY System account.
        
Your One-Time Password (OTP) is: {otp}
        
This code is valid for a short time. Please enter it on the website to reset your password.
        
If you did not request a password reset, please ignore this email."""

        msg = MIMEMultipart()
        msg['From'] = SENDER_EMAIL
        msg['To'] = recipient_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls() 
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.sendmail(SENDER_EMAIL, recipient_email, msg.as_string())
        server.quit()

    except Exception as e:
        logger.error(f"Failed to send OTP email to {recipient_email}. Error: {e}")

def send_notification_email(recipient_email: str, subject: str, body: str):
   
    if not SENDER_EMAIL or not SENDER_PASSWORD:
        print("Error: Email credentials are missing from the .env file.")
        return

    try:
        msg = MIMEMultipart()
        msg['From'] = SENDER_EMAIL
        msg['To'] = recipient_email
        msg['Subject'] = subject

        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls() 
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        
        text = msg.as_string()
        server.sendmail(SENDER_EMAIL, recipient_email, text)
        
        print(f"Successfully sent background email to {recipient_email}")
        
    except Exception as e:
        print(f"Failed to send email: {e}")
        
    finally:
        server.quit()

