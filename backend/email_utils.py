import os
import requests
import logging
from dotenv import load_dotenv

load_dotenv()

BREVO_API_KEY = os.getenv("BREVO_API_KEY")
FRONTEND_URL = os.getenv("FRONTEND_URL")

SENDER_EMAIL = os.getenv("SENDER_EMAIL", "gabay.system@gmail.com") 
ADMIN_RECEIVING_EMAIL = SENDER_EMAIL

logger = logging.getLogger(__name__)

def generate_email_html(body_content: str) -> str:
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="background-color: #f4f5f7; margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f4f5f7; padding: 40px 0;">
        <tr>
          <td align="center">
            
            <!-- Main Content Card -->
            <table width="100%" max-width="600" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); max-width: 600px; width: 100%;">
              
              <!-- Colored Header -->
              <tr>
                <td align="center" style="background-color: #0b3b60; padding: 35px 20px; border-radius: 8px 8px 0 0;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 32px; letter-spacing: 3px;">GABAY SYSTEM</h1>
                </td>
              </tr>

              <!-- Dynamic Body -->
              <tr>
                <td style="padding: 40px 40px 30px 40px;">
                  {body_content}
                </td>
              </tr>

              <!-- Help Section -->
              <tr>
                <td style="background-color: #fff4e6; padding: 25px; text-align: center; border-top: 1px solid #f9e3c8; border-radius: 0 0 8px 8px;">
                  <p style="margin: 0; color: #8a6d3b; font-size: 15px;">
                    Need more help?<br>
                    <a href="https://web.facebook.com/onecainta.onecainta" style="color: #d97706; text-decoration: none; font-weight: bold; display: inline-block; margin-top: 6px;">We're here, ready to talk</a>
                  </p>
                </td>
              </tr>
            </table>

            <!-- Footer -->
            <table width="100%" max-width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; width: 100%;">
              <tr>
                <td align="center" style="padding: 30px 20px; color: #888888; font-size: 12px; line-height: 1.6;">
                  <p style="margin: 0 0 10px 0; font-size: 14px; color: #666666;"><strong>Cainta Municipal Hospital</strong></p>
                  <p style="margin: 0 0 10px 0;">
                    Municipal Compound, Brgy. Sto. Domingo,<br>
                    Cainta, Rizal, 1900
                  </p>
                  <p style="margin: 0 0 15px 0;">
                    Hotlines: <a href="tel:86962605" style="color: #888888; text-decoration: none;">8696-2605</a> (Hospital) | <a href="tel:85350131" style="color: #888888; text-decoration: none;">8535-0131</a> (Rescue 131)
                  </p>
                  <p style="margin: 0;">
                    <a href="https://web.facebook.com/onecainta.onecainta" style="color: #888888; text-decoration: underline;">Visit our Facebook Page</a>
                  </p>
                  <p style="margin: 15px 0 0 0; font-size: 10px; color: #aaaaaa;">
                    &copy; 2026 GABAY System. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>

          </td>
        </tr>
      </table>
    </body>
    </html>
    """

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
        print(f"✅ SUCCESS: Email sent to {to_email}")
    except requests.exceptions.RequestException as e:
        print(f"❌ BREVO ERROR: Failed to send email to {to_email}. Error: {e}")
        logger.error(f"Failed to send email to {to_email}. Error: {e}")

# ==========================================
# EMAIL VERIFICATION FUNCTION
# ==========================================
def send_verification_email(recipient_email: str, token: str):
    verification_link = f"{FRONTEND_URL}/verify-email?token={token}"
    
    content = f"""
    <h2 style="color: #333333; text-align: center; margin-top: 0; font-size: 26px;">Welcome!</h2>
    <p style="color: #555555; font-size: 16px; line-height: 1.6; text-align: center;">We're excited to have you get started. First, you need to confirm your account. Just press the button below.</p>
    
    <div style="text-align: center; margin: 35px 0;">
        <a href="{verification_link}" style="background-color: #0f766e; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px; display: inline-block;">Confirm Account</a>
    </div>
    
    <p style="color: #777777; font-size: 14px; text-align: center;">If that doesn't work, copy and paste the following link in your browser:<br>
    <a href="{verification_link}" style="color: #d97706; word-break: break-all; margin-top: 10px; display: inline-block;">{verification_link}</a></p>
    
    <p style="color: #777777; font-size: 14px; text-align: center; margin-top: 30px;">If you have any questions, just reply to this email—we're always happy to help out.</p>
    <p style="color: #777777; font-size: 14px; text-align: center; margin-top: 20px;">Cheers,<br>The GABAY Team</p>
    """
    
    send_brevo_email(recipient_email, "GABAY System: Verify Your Email Address", generate_email_html(content))

# ==========================================
# EMAIL OTP FUNCTION
# ==========================================
def send_otp_email(recipient_email: str, otp: str):
    content = f"""
    <h2 style="color: #333333; text-align: center; margin-top: 0; font-size: 24px;">Password Reset</h2>
    <p style="color: #555555; font-size: 16px; line-height: 1.6; text-align: center;">We received a request to reset the password for your GABAY System account.</p>
    
    <div style="text-align: center; margin: 35px 0; background-color: #f4f6f8; padding: 25px; border-radius: 8px; border: 1px dashed #cccccc;">
        <p style="margin: 0 0 10px 0; font-size: 12px; color: #888888; text-transform: uppercase; letter-spacing: 1px;">Your One-Time Password</p>
        <h1 style="margin: 0; color: #0b3b60; font-size: 42px; letter-spacing: 6px;">{otp}</h1>
    </div>
    
    <p style="color: #777777; font-size: 14px; text-align: center;">This code is valid for a short time. Please enter it on the website to reset your password.</p>
    <p style="color: #999999; font-size: 12px; text-align: center; margin-top: 30px;">If you did not request a password reset, please feel free to ignore this email.</p>
    """
    send_brevo_email(recipient_email, "GABAY System: Password Reset OTP", generate_email_html(content))

# ==========================================
# EMAIL NOTIFICATION 
# ==========================================
def send_notification_email(recipient_email: str, subject: str, body: str):
    formatted_body = body.replace('\n', '<br>')
    
    content = f"""
    <h2 style="color: #333333; text-align: center; margin-top: 0; font-size: 24px;">System Notification</h2>
    <p style="color: #555555; font-size: 16px; line-height: 1.6; text-align: left;">{formatted_body}</p>
    """
    
    send_brevo_email(recipient_email, subject, generate_email_html(content))

# ==========================================
# CONTACT US EMAIL FUNCTION
# ==========================================
def send_contact_us_email(name: str, user_email: str, subject: str, message: str):
    email_subject = f"New GABAY Inquiry: {subject}"
    formatted_message = message.replace('\n', '<br>')
    
    content = f"""
    <h2 style="color: #333333; margin-top: 0; font-size: 22px;">New Contact Form Submission</h2>
    <div style="background-color: #f4f6f8; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #0f766e;">
        <p style="margin: 0 0 5px 0; color: #333333; font-size: 15px;"><strong>From:</strong> {name}</p>
        <p style="margin: 0 0 5px 0; color: #333333; font-size: 15px;"><strong>Email:</strong> {user_email}</p>
        <p style="margin: 0; color: #333333; font-size: 15px;"><strong>Subject:</strong> {subject}</p>
    </div>
    <h4 style="color: #333333; margin-bottom: 10px; font-size: 16px;">Message:</h4>
    <p style="color: #555555; font-size: 15px; line-height: 1.6; background-color: #ffffff; border: 1px solid #eeeeee; padding: 15px; border-radius: 5px;">{formatted_message}</p>
    """
    
    send_brevo_email(ADMIN_RECEIVING_EMAIL, email_subject, generate_email_html(content), reply_to=user_email)

# ==========================================
# PERSONNEL CREDENTIALS EMAIL FUNCTION
# ==========================================
def send_personnel_credentials_email(recipient_email: str, name: str, role: str, raw_password: str):
    content = f"""
    <h2 style="color: #333333; text-align: center; margin-top: 0; font-size: 24px;">Welcome to the Team!</h2>
    <p style="color: #555555; font-size: 16px; line-height: 1.6; text-align: center;">Hello <strong>{name}</strong>,</p>
    <p style="color: #555555; font-size: 16px; line-height: 1.6; text-align: center;">An administrator has created a new GABAY <strong>{role}</strong> account for you. You can now log into the Administrative Portal using the credentials below:</p>
    
    <div style="background-color: #f4f6f8; padding: 20px; border-radius: 5px; margin: 30px 0; border-left: 4px solid #0b3b60; text-align: left;">
        <p style="margin: 0 0 10px 0; color: #333333; font-size: 15px;"><strong>Email:</strong> {recipient_email}</p>
        <p style="margin: 0; color: #333333; font-size: 15px;"><strong>Temporary Password:</strong> <span style="font-family: monospace; font-size: 18px; color: #0b3b60; font-weight: bold; margin-left: 5px;">{raw_password}</span></p>
    </div>
    
    <p style="color: #d9534f; font-size: 14px; text-align: center; margin-top: 20px; padding: 10px; background-color: #fdf2f2; border-radius: 4px;">
        <em><strong>Important:</strong> For security purposes, please log in and change your password immediately via your account settings.</em>
    </p>
    """
    send_brevo_email(recipient_email, f"Welcome to GABAY - Your {role} Account Credentials", generate_email_html(content))

# ==========================================
# APPOINTMENT STATUS UPDATE EMAIL FUNCTION
# ==========================================
def send_patient_appointment_email(recipient_email: str, name: str, status: str, doctor_name: str, date: str, additional_notes: str = ""):
    status_upper = status.upper()
    if "APPROVE" in status_upper:
        color_hex = "#0f766e" 
        message = "has been officially <strong>approved</strong>."
    elif "CANCEL" in status_upper or "DENY" in status_upper:
        color_hex = "#dc2626" 
        message = "has been <strong>cancelled</strong>."
    elif "RESCHEDULE" in status_upper:
        color_hex = "#d97706" 
        message = "has been <strong>rescheduled</strong>."
    else:
        color_hex = "#0b3b60"
        message = f"has been updated to: <strong>{status}</strong>."

    content = f"""
    <h2 style="color: {color_hex}; text-align: center; margin-top: 0; font-size: 24px;">Appointment {status.title()}</h2>
    <p style="color: #555555; font-size: 16px; line-height: 1.6; text-align: center;">Hello <strong>{name}</strong>,</p>
    <p style="color: #555555; font-size: 16px; line-height: 1.6; text-align: center;">Your appointment request through the GABAY System {message}</p>
    
    <div style="background-color: #f4f6f8; padding: 20px; border-radius: 5px; margin: 30px 0; border-left: 4px solid {color_hex}; text-align: left;">
        <p style="margin: 0 0 10px 0; font-size: 15px; color: #333333;"><strong>Doctor:</strong> {doctor_name}</p>
        <p style="margin: 0 0 10px 0; font-size: 15px; color: #333333;"><strong>Date:</strong> {date}</p>
        {f'<p style="margin: 0; font-size: 15px; color: #555555;"><strong>Notes:</strong> {additional_notes}</p>' if additional_notes else ''}
    </div>
    
    <p style="color: #777777; font-size: 14px; text-align: center;">Log in to your GABAY Patient Portal to view your full appointment history and details.</p>
    """
    
    send_brevo_email(recipient_email, f"GABAY System: Appointment {status.title()}", generate_email_html(content))

# ==========================================
# APPOINTMENT REQUEST RECEIVED EMAIL
# ==========================================
def send_appointment_received_email(
    recipient_email: str, 
    name: str, 
    department_name: str, 
    appointment_type: str, 
    start_date: str, 
    end_date: str, 
    doctor_name: str, 
    reason: str
):
    color_hex = "#0b3b60" 
    
    date_display = f"{start_date} to {end_date}" if end_date and start_date != end_date else str(start_date)

    content = f"""
    <h2 style="color: {color_hex}; text-align: center; margin-top: 0; font-size: 24px;">Appointment Request Received</h2>
    <p style="color: #555555; font-size: 16px; line-height: 1.6; text-align: center;">Hello <strong>{name}</strong>,</p>
    <p style="color: #555555; font-size: 16px; line-height: 1.6; text-align: center;">We have successfully received your appointment request for the <strong>{department_name}</strong> department. It is currently <strong style="color: #d97706;">PENDING APPROVAL</strong> by our hospital staff.</p>
    
    <div style="background-color: #f4f6f8; padding: 20px; border-radius: 5px; margin: 30px 0; border-left: 4px solid {color_hex}; text-align: left;">
        <p style="margin: 0 0 10px 0; font-size: 15px; color: #333333;"><strong>Type:</strong> {appointment_type} OPD</p>
        <p style="margin: 0 0 10px 0; font-size: 15px; color: #333333;"><strong>Preferred Date(s):</strong> {date_display}</p>
        <p style="margin: 0 0 10px 0; font-size: 15px; color: #333333;"><strong>Assigned Doctor:</strong> {doctor_name}</p>
        <p style="margin: 0; font-size: 15px; color: #555555;"><strong>Reason:</strong> {reason}</p>
    </div>
    
    <p style="color: #777777; font-size: 14px; text-align: center;">We will send another email once your schedule is officially confirmed. Thank you for using the GABAY System!</p>
    """
    
    send_brevo_email(recipient_email, "GABAY: Appointment Request Received", generate_email_html(content))