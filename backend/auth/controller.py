import secrets
import pyodbc
from datetime import datetime, timedelta, timezone
import jwt
from flask import g
from werkzeug.security import generate_password_hash, check_password_hash
from config import Config
from models import user_model, reset_model
from services.mailer import send_mail
from services.validator import EMAIL_RE

OTP_MAX_ATTEMPTS = 5
RESEND_SECONDS = 60
SENT_MESSAGE = "If this email is registered, a 6-digit code has been sent to it."


def _utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _make_token(user_id):
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=Config.JWT_EXPIRY_HOURS),
    }
    return jwt.encode(payload, Config.SECRET_KEY, algorithm="HS256")


def _public(user):
    created = user.get("created_at")
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "created_at": created.isoformat() if created else None,
    }


def register_user(data):
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not name or not email or not password:
        return {"error": "Fill in all the fields."}, 400
    if len(name) > 100 or len(email) > 150:
        return {"error": "Name or email is too long."}, 400
    if not EMAIL_RE.fullmatch(email):
        return {"error": "Enter a valid email address."}, 400
    if len(password) < 8:
        return {"error": "Password must be at least 8 characters."}, 400
    if user_model.get_by_email(email):
        return {"error": "This email is already registered."}, 409

    try:
        user_model.create_user(name, email, generate_password_hash(password))
    except pyodbc.IntegrityError:
        return {"error": "This email is already registered."}, 409
    return {"message": "Account created. Please log in."}, 201


def login_user(data):
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return {"error": "Enter your email and password."}, 400

    user = user_model.get_by_email(email)
    if not user or not check_password_hash(user["password_hash"], password):
        return {"error": "Wrong email or password."}, 401
    if user["is_blocked"]:
        return {"error": "Your account is blocked."}, 403

    return {"token": _make_token(user["id"]), "user": _public(user)}, 200


def get_current_user():
    return {"user": _public(g.user)}, 200


def update_profile(data):
    name = (data.get("name") or "").strip()
    if not name:
        return {"error": "Enter your name."}, 400
    if len(name) > 100:
        return {"error": "Name is too long."}, 400
    user_model.update_name(g.user["id"], name)
    user = user_model.get_by_id(g.user["id"])
    return {"message": "Profile updated.", "user": _public(user)}, 200


def change_password(data):
    current = data.get("current_password") or ""
    new_password = data.get("new_password") or ""
    if not check_password_hash(g.user["password_hash"], current):
        return {"error": "Current password is wrong."}, 400
    if len(new_password) < 8:
        return {"error": "New password must be at least 8 characters."}, 400
    user_model.update_password(g.user["id"], generate_password_hash(new_password))
    return {"message": "Password changed."}, 200


def forgot_password(data):
    email = (data.get("email") or "").strip().lower()
    if not email or not EMAIL_RE.fullmatch(email):
        return {"error": "Enter a valid email address."}, 400

    user = user_model.get_by_email(email)
    if user and not user["is_blocked"]:
        latest = reset_model.get_latest(user["id"])
        too_soon = latest and (_utcnow() - latest["created_at"]).total_seconds() < RESEND_SECONDS
        if not too_soon:
            otp = f"{secrets.randbelow(10 ** 6):06d}"
            expires = _utcnow() + timedelta(minutes=Config.OTP_EXPIRY_MINUTES)
            reset_model.create_reset(user["id"], generate_password_hash(otp), expires)
            body = (
                f"Hi {user['name']},\n\n"
                f"Your Resume Analyser password reset code is: {otp}\n\n"
                f"It expires in {Config.OTP_EXPIRY_MINUTES} minutes and can be used once.\n"
                f"If you did not ask for this, you can ignore this email.\n"
            )
            if not send_mail(user["email"], "Your Resume Analyser password reset code", body):
                reset_model.delete_for_user(user["id"])
                return {"error": "Could not send the email. Please try again later."}, 500

    return {"message": SENT_MESSAGE}, 200


def reset_password(data):
    email = (data.get("email") or "").strip().lower()
    otp = (data.get("otp") or "").strip()
    new_password = data.get("new_password") or ""

    if not email or not otp or not new_password:
        return {"error": "Fill in all the fields."}, 400
    if len(new_password) < 8:
        return {"error": "New password must be at least 8 characters."}, 400

    invalid = ({"error": "Invalid or expired code."}, 400)

    user = user_model.get_by_email(email)
    if not user:
        return invalid
    reset = reset_model.get_latest(user["id"])
    if not reset:
        return invalid
    if reset["expires_at"] < _utcnow() or reset["attempts"] >= OTP_MAX_ATTEMPTS:
        reset_model.delete_for_user(user["id"])
        return invalid
    if not check_password_hash(reset["otp_hash"], otp):
        reset_model.add_attempt(reset["id"])
        return invalid

    user_model.update_password(user["id"], generate_password_hash(new_password))
    reset_model.delete_for_user(user["id"])
    return {"message": "Password reset. You can log in now."}, 200