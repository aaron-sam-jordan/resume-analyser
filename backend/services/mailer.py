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

    try:
        with smtplib.SMTP(Config.SMTP_HOST, Config.SMTP_PORT, timeout=15) as server:
            server.starttls(context=ssl.create_default_context())
            server.login(Config.SMTP_USER, Config.SMTP_PASSWORD.replace(" ", ""))
            server.send_message(msg)
        return True
    except Exception:
        logging.exception("Could not send email")
        return False