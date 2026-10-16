import json
from collections import Counter
from datetime import date, timedelta
from db.database import fetch_one, fetch_all, insert


def _clean(row):
    if row is None:
        return None
    for key in ("score", "skill_score", "text_score"):
        if key in row and row[key] is not None:
            row[key] = float(row[key])
    if "created_at" in row and row["created_at"] is not None:
        row["created_at"] = row["created_at"].isoformat()
    return row


def _load_json(row):
    if row is None:
        return None
    row["matched_skills"] = json.loads(row["matched_skills"] or "[]")
    row["missing_skills"] = json.loads(row["missing_skills"] or "[]")
    row["details"] = json.loads(row["details"] or "{}")
    return row


def save_analysis(user_id, job_title, filename, score, skill_score,
                  text_score, matched, missing, details):
    sql = """
        INSERT INTO analyses
            (user_id, job_title, resume_filename, score, skill_score,
             text_score, matched_skills, missing_skills, details)
        OUTPUT INSERTED.id
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    return insert(sql, (user_id, job_title, filename, score, skill_score,
                        text_score, json.dumps(matched), json.dumps(missing),
                        json.dumps(details)))


def get_by_user(user_id):
    sql = """
        SELECT id, job_title, resume_filename, score, created_at
        FROM analyses WHERE user_id = ? ORDER BY created_at DESC
    """
    return [_clean(r) for r in fetch_all(sql, (user_id,))]


def get_one_for_user(analysis_id, user_id):
    row = fetch_one("SELECT * FROM analyses WHERE id = ? AND user_id = ?",
                    (analysis_id, user_id))
    return _load_json(_clean(row))


def list_all(limit=50):
    sql = """
        SELECT TOP (?) a.id, u.name AS user_name, a.job_title, a.score,
               a.missing_skills, a.created_at
        FROM analyses a JOIN users u ON u.id = a.user_id
        ORDER BY a.created_at DESC
    """
    rows = [_clean(r) for r in fetch_all(sql, (limit,))]
    for r in rows:
        r["missing_skills"] = json.loads(r["missing_skills"] or "[]")
    return rows


def summary():
    row = fetch_one("SELECT COUNT(*) AS total, AVG(score) AS avg_score FROM analyses")
    return {"total": row["total"],
            "average_score": round(float(row["avg_score"] or 0), 1)}


def analyses_per_day(days=7):
    sql = """
        SELECT CAST(created_at AS DATE) AS day, COUNT(*) AS total
        FROM analyses
        WHERE created_at >= DATEADD(DAY, ?, CAST(GETDATE() AS DATE))
        GROUP BY CAST(created_at AS DATE)
    """
    counts = {r["day"]: r["total"] for r in fetch_all(sql, (-(days - 1),))}
    result = []
    for i in range(days - 1, -1, -1):
        d = date.today() - timedelta(days=i)
        result.append({"date": d.isoformat(), "total": counts.get(d, 0)})
    return result


def score_distribution():
    buckets = {"0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0}
    for r in fetch_all("SELECT score FROM analyses"):
        s = float(r["score"])
        if s <= 20:
            buckets["0-20"] += 1
        elif s <= 40:
            buckets["21-40"] += 1
        elif s <= 60:
            buckets["41-60"] += 1
        elif s <= 80:
            buckets["61-80"] += 1
        else:
            buckets["81-100"] += 1
    return buckets


def most_missing_skills(limit=5):
    counter = Counter()
    for r in fetch_all("SELECT missing_skills FROM analyses"):
        counter.update(json.loads(r["missing_skills"] or "[]"))
    return [{"skill": k, "count": v} for k, v in counter.most_common(limit)]


def list_for_admin(user_id):
    # Privacy: no resume file name and no resume content, only results
    sql = """
        SELECT id, job_title, score, skill_score, text_score,
               matched_skills, missing_skills, created_at
        FROM analyses WHERE user_id = ? ORDER BY created_at DESC
    """
    rows = [_clean(r) for r in fetch_all(sql, (user_id,))]
    for r in rows:
        r["matched_skills"] = json.loads(r["matched_skills"] or "[]")
        r["missing_skills"] = json.loads(r["missing_skills"] or "[]")
    return rows