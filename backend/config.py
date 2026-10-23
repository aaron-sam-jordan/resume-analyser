import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY")
    JWT_EXPIRY_HOURS = int(os.getenv("JWT_EXPIRY_HOURS", 8))
    MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", 5))
    MAX_CONTENT_LENGTH = MAX_UPLOAD_MB * 1024 * 1024
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

    DB_SERVER = os.getenv("DB_SERVER")
    DB_NAME = os.getenv("DB_NAME")
    DB_DRIVER = os.getenv("DB_DRIVER")

    SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
    SMTP_USER = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
    MAIL_FROM = os.getenv("MAIL_FROM", "")
    OTP_EXPIRY_MINUTES = int(os.getenv("OTP_EXPIRY_MINUTES", 10))

    @classmethod
    def db_connection_string(cls):
        return (
            f"DRIVER={{{cls.DB_DRIVER}}};"
            f"SERVER={cls.DB_SERVER};"
            f"DATABASE={cls.DB_NAME};"
            "Trusted_Connection=yes;"
        )


if not Config.SECRET_KEY:
    raise RuntimeError("SECRET_KEY is missing in .env")