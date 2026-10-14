from flask import Blueprint, request, jsonify
from middleware.auth_middleware import login_required
from analyser import controller

analyser_bp = Blueprint("analyser", __name__, url_prefix="/api")


@analyser_bp.route("/analyse", methods=["POST"])
@login_required
def analyse():
    body, status = controller.analyse_resume(
        request.files.get("resume"),
        request.form.get("jd", ""),
        request.form.get("job_title", ""),
    )
    return jsonify(body), status


@analyser_bp.route("/analyses", methods=["GET"])
@login_required
def history():
    body, status = controller.my_history()
    return jsonify(body), status


@analyser_bp.route("/analyses/<int:analysis_id>", methods=["GET"])
@login_required
def one(analysis_id):
    body, status = controller.get_one(analysis_id)
    return jsonify(body), status