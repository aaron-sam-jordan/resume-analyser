import logging
import smtplib
import ssl
from email.message import EmailMessage
from config import Config


def send_mail(to, subject, body):
    if not Config.SMTP_USER or not Config.SMTP_PASSWORD:
        print(f"\n[DEV MAIL, SMTP not configured]\nTo: {to}\nSubject: {subject}\n{body}\n")
        return True

    msg = EmailMessage()
    msg["From"] = Config.MAIL_FROM or Config.SMTP_USER
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(body)

    password = Config.SMTP_PASSWORD.replace(" ", "")
    context = ssl.create_default_context()

    try:
        if Config.SMTP_PORT == 465:
            with smtplib.SMTP_SSL(Config.SMTP_HOST, 465, context=context, timeout=20) as server:
                server.login(Config.SMTP_USER, password)
                server.send_message(msg)
        else:
            with smtplib.SMTP(Config.SMTP_HOST, Config.SMTP_PORT, timeout=20) as server:
                server.ehlo()
                server.starttls(context=context)
                server.ehlo()
                server.login(Config.SMTP_USER, password)
                server.send_message(msg)
        return True
    except smtplib.SMTPAuthenticationError:
        logging.error("Gmail rejected the login. Check SMTP_USER and the app password.")
        return False
    except Exception:
        logging.exception("Could not send email")
        return False