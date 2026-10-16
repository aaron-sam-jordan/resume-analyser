from collections import Counter
from models import user_model, analysis_model, skill_model
from services.skills_data import CATEGORIES


def dashboard_stats():
    summary = analysis_model.summary()
    return {
        "total_users": user_model.count_users(),
        "total_analyses": summary["total"],
        "average_score": summary["average_score"],
        "blocked_users": user_model.count_blocked(),
        "analyses_per_day": analysis_model.analyses_per_day(7),
        "score_distribution": analysis_model.score_distribution(),
        "most_missing_skills": analysis_model.most_missing_skills(5),
    }, 200


def list_users():
    users = user_model.list_users()
    for u in users:
        u["created_at"] = u["created_at"].isoformat()
    return {"users": users}, 200


def toggle_block(user_id):
    user = user_model.get_by_id(user_id)
    if not user:
        return {"error": "User not found."}, 404
    if user["role"] == "admin":
        return {"error": "You cannot block an admin."}, 403
    new_value = not user["is_blocked"]
    user_model.set_blocked(user_id, new_value)
    return {"message": "Blocked." if new_value else "Unblocked.",
            "is_blocked": new_value}, 200


def delete_user(user_id):
    user = user_model.get_by_id(user_id)
    if not user:
        return {"error": "User not found."}, 404
    if user["role"] == "admin":
        return {"error": "You cannot delete an admin."}, 403
    user_model.delete_user(user_id)
    return {"message": "User deleted."}, 200


def list_analyses():
    return {"analyses": analysis_model.list_all(50)}, 200


def list_categories():
    return {"categories": CATEGORIES}, 200


def list_skills():
    return {"skills": skill_model.get_all()}, 200


def add_skill(data):
    name = (data.get("name") or "").strip()
    category = data.get("category") or ""

    if not name:
        return {"error": "Enter a skill name."}, 400
    if len(name) > 100:
        return {"error": "Skill name is too long."}, 400
    if category not in CATEGORIES:
        return {"error": "Choose a valid category."}, 400
    if skill_model.get_by_name(name):
        return {"error": "This skill already exists."}, 409

    new_id = skill_model.add_skill(name, category)
    return {"message": "Skill added.", "id": new_id}, 201


def remove_skill(skill_id):
    if skill_model.remove_skill(skill_id) == 0:
        return {"error": "Skill not found."}, 404
    return {"message": "Skill removed."}, 200


def user_detail(user_id):
    user = user_model.get_by_id(user_id)
    if not user:
        return {"error": "User not found."}, 404

    analyses = analysis_model.list_for_admin(user_id)
    scores = [a["score"] for a in analyses]

    missing = Counter()
    for a in analyses:
        missing.update(a["missing_skills"])

    return {
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "is_blocked": bool(user["is_blocked"]),
            "created_at": user["created_at"].isoformat(),
        },
        "summary": {
            "total_analyses": len(analyses),
            "average_score": round(sum(scores) / len(scores), 1) if scores else 0,
            "best_score": max(scores) if scores else 0,
            "last_active": analyses[0]["created_at"] if analyses else None,
            "top_missing_skills": [{"skill": k, "count": v} for k, v in missing.most_common(3)],
        },
        "history": [{"date": a["created_at"], "score": a["score"]} for a in reversed(analyses)],
        "analyses": analyses,
    }, 200