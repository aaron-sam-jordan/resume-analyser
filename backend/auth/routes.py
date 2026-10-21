from flask import Blueprint, request, jsonify
from middleware.auth_middleware import login_required
from auth import controller

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    body, status = controller.register_user(request.get_json(silent=True) or {})
    return jsonify(body), status


@auth_bp.route("/login", methods=["POST"])
def login():
    body, status = controller.login_user(request.get_json(silent=True) or {})
    return jsonify(body), status


@auth_bp.route("/me", methods=["GET"])
@login_required
def me():
    body, status = controller.get_current_user()
    return jsonify(body), status

@auth_bp.route("/profile", methods=["PATCH"])
@login_required
def update_profile():
    body, status = controller.update_profile(request.get_json(silent=True) or {})
    return jsonify(body), status


@auth_bp.route("/change-password", methods=["POST"])
@login_required
def change_password():
    body, status = controller.change_password(request.get_json(silent=True) or {})
    return jsonify(body), status