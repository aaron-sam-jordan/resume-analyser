import pyodbc
from datetime import datetime, timedelta, timezone
import jwt
from flask import g
from werkzeug.security import generate_password_hash, check_password_hash
from config import Config
from models import user_model
from services.validator import EMAIL_RE


def _make_token(user_id):
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=Config.JWT_EXPIRY_HOURS),
    }
    return jwt.encode(payload, Config.SECRET_KEY, algorithm="HS256")


def _public(user):
    return {"id": user["id"], "name": user["name"],
            "email": user["email"], "role": user["role"]}


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