import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from services.cleaner import normalize, clean_text
from services.skills_data import CATEGORIES, expand_synonyms, suggestion_for

WEIGHT_SKILLS = 0.7
WEIGHT_TEXT = 0.3
KEY_SECTIONS = ["education", "skills", "projects", "experience"]


def _prepare(text):
    return expand_synonyms(normalize(text))


def _skill_pattern(name):
    return re.compile(
        rf"(?<![a-z0-9+#.]){re.escape(normalize(name))}(?![a-z0-9+#])(?!\.[a-z0-9])"
    )


def find_skills(prepared_text, skills):
    return [s for s in skills if _skill_pattern(s["name"]).search(prepared_text)]


def skill_match(resume_skills, jd_skills):
    resume_names = {s["name"] for s in resume_skills}
    matched = [s for s in jd_skills if s["name"] in resume_names]
    missing = [s for s in jd_skills if s["name"] not in resume_names]
    score = round(len(matched) / len(jd_skills) * 100, 1)
    return matched, missing, score


def text_similarity(resume_clean, jd_clean):
    if not resume_clean or not jd_clean:
        return 0.0, []
    vec = TfidfVectorizer()
    matrix = vec.fit_transform([resume_clean, jd_clean])
    similarity = cosine_similarity(matrix[0], matrix[1])[0][0]

    row = matrix[0].toarray()[0]
    words = vec.get_feature_names_out()
    top = row.argsort()[::-1][:6]
    keywords = [{"word": words[i], "score": round(float(row[i]), 2)}
                for i in top if row[i] > 0]
    return round(float(similarity) * 100, 1), keywords


def sections_found(prepared_text):
    return [w for w in KEY_SECTIONS if re.search(rf"\b{w}\b", prepared_text)]


def category_counts(resume_skills, jd_skills):
    counts = {c: {"resume": 0, "job": 0} for c in CATEGORIES}
    for s in resume_skills:
        if s["category"] in counts:
            counts[s["category"]]["resume"] += 1
    for s in jd_skills:
        if s["category"] in counts:
            counts[s["category"]]["job"] += 1
    return counts


def final_score(skill_score, text_score):
    return round(WEIGHT_SKILLS * skill_score + WEIGHT_TEXT * text_score, 1)


def analyse(resume_text, jd_text, skills):
    resume_prep = _prepare(resume_text)
    jd_prep = _prepare(jd_text)

    jd_skills = find_skills(jd_prep, skills)
    if not jd_skills:
        return None, "No recognisable skills found in the job description. Paste the full job posting."
    resume_skills = find_skills(resume_prep, skills)

    matched, missing, skill_score = skill_match(resume_skills, jd_skills)
    text_score, keywords = text_similarity(clean_text(resume_prep), clean_text(jd_prep))
    score = final_score(skill_score, text_score)

    suggestions = [suggestion_for(s["name"], s["category"]) for s in missing[:5]]
    found = sections_found(resume_prep)
    for section in KEY_SECTIONS:
        if section not in found:
            suggestions.append(f"Add a clear {section.title()} section to your resume.")

    result = {
        "score": score,
        "skill_score": skill_score,
        "text_score": text_score,
        "matched_skills": [s["name"] for s in matched],
        "missing_skills": [s["name"] for s in missing],
        "suggestions": suggestions,
        "details": {
            "categories": category_counts(resume_skills, jd_skills),
            "top_keywords": keywords,
            "sections_found": found,
        },
    }
    return result, None