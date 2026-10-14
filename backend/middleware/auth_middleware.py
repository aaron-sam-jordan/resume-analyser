from functools import wraps
import jwt
from flask import request, jsonify, g
from config import Config
from models.user_model import get_by_id


def _get_token():
    header = request.headers.get("Authorization", "")
    if header.startswith("Bearer "):
        return header[7:]
    return None


def login_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        token = _get_token()
        if not token:
            return jsonify({"error": "Login required"}), 401

        try:
            payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Session expired, please log in again"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        user = get_by_id(payload["user_id"])
        if not user:
            return jsonify({"error": "Account no longer exists"}), 401
        if user["is_blocked"]:
            return jsonify({"error": "Your account is blocked"}), 403

        g.user = user
        return func(*args, **kwargs)
    return wrapper


def admin_required(func):
    @login_required
    @wraps(func)
    def wrapper(*args, **kwargs):
        if g.user["role"] != "admin":
            return jsonify({"error": "Admin access only"}), 403
        return func(*args, **kwargs)
    return wrapper