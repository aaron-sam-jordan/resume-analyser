import os
from flask import g 
from models import analysis_model, skill_model 
from services.validator import check_file, check_jd, check_resume_text, length_rule
from services.experience import compare as compare_experience
from services.extractor import extract_text
from services.matcher import analyse


def _shape(row):
    details = row.pop("details")
    row["suggestions"] = details.pop("suggestions", [])
    row["details"] = details
    return row


def analyse_resume(file, jd, job_title):
    error = check_file(file)
    if error:
        return {"error": error}, 400
    error = check_jd(jd)
    if error:
        return {"error": error}, 400

    text, page_count, error = extract_text(file)
    if error:
        return {"error": error}, 422
    error = check_resume_text(text)
    if error:
        return {"error": error}, 422

    result, error = analyse(text, jd, skill_model.get_all())
    if error:
        return {"error": error}, 422

    exp, exp_note = compare_experience(text, jd)
    result["details"]["experience"] = exp
    if exp_note:
        result["suggestions"].append(exp_note)

    length_msg, cap = length_rule(page_count)
    length_penalty = cap is not None
    if length_penalty:
        result["score"] = min(result["score"], cap)
    if length_msg:
        result["suggestions"].insert(0, length_msg)
    result["details"]["page_count"] = page_count
    result["details"]["length_penalty"] = length_penalty

    title = (job_title or "").strip()[:150] or None
    filename = os.path.basename(file.filename)[:255]
    saved_details = {**result["details"], "suggestions": result["suggestions"]}

    result["id"] = analysis_model.save_analysis(
        g.user["id"], title, filename, result["score"], result["skill_score"],
        result["text_score"], result["matched_skills"], result["missing_skills"],
        saved_details)
    result["job_title"] = title
    result["resume_filename"] = filename
    return result, 201


def my_history():
    return {"analyses": analysis_model.get_by_user(g.user["id"])}, 200


def get_one(analysis_id):
    row = analysis_model.get_one_for_user(analysis_id, g.user["id"])
    if not row:
        return {"error": "Analysis not found."}, 404
    return _shape(row), 200