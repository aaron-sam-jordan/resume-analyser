from flask import Blueprint, request, jsonify
from middleware.auth_middleware import admin_required
from admin import controller

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@admin_bp.route("/stats", methods=["GET"])
@admin_required
def stats():
    body, status = controller.dashboard_stats()
    return jsonify(body), status


@admin_bp.route("/users", methods=["GET"])
@admin_required
def users():
    body, status = controller.list_users()
    return jsonify(body), status


@admin_bp.route("/users/<int:user_id>/block", methods=["PATCH"])
@admin_required
def block(user_id):
    body, status = controller.toggle_block(user_id)
    return jsonify(body), status


@admin_bp.route("/users/<int:user_id>", methods=["DELETE"])
@admin_required
def remove_user(user_id):
    body, status = controller.delete_user(user_id)
    return jsonify(body), status


@admin_bp.route("/analyses", methods=["GET"])
@admin_required
def analyses():
    body, status = controller.list_analyses()
    return jsonify(body), status


@admin_bp.route("/categories", methods=["GET"])
@admin_required
def categories():
    body, status = controller.list_categories()
    return jsonify(body), status


@admin_bp.route("/skills", methods=["GET"])
@admin_required
def skills():
    body, status = controller.list_skills()
    return jsonify(body), status


@admin_bp.route("/skills", methods=["POST"])
@admin_required
def create_skill():
    body, status = controller.add_skill(request.get_json(silent=True) or {})
    return jsonify(body), status


@admin_bp.route("/skills/<int:skill_id>", methods=["DELETE"])
@admin_required
def delete_skill(skill_id):
    body, status = controller.remove_skill(skill_id)
    return jsonify(body), status


@admin_bp.route("/users/<int:user_id>", methods=["GET"])
@admin_required
def user_detail(user_id):
    body, status = controller.user_detail(user_id)
    return jsonify(body), status