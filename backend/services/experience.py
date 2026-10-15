import re
from datetime import date

RANGE_RE = re.compile(
    r"(?:(\d{1,2})/)?((?:19|20)\d{2})\s*(?:-|–|—|to)\s*"
    r"(?:(?:(\d{1,2})/)?((?:19|20)\d{2})|(present|current|now))",
    re.IGNORECASE,
)
EXPLICIT_RE = re.compile(r"(\d{1,2})\s*\+?\s*(?:years|yrs)", re.IGNORECASE)
JD_YEARS_RE = re.compile(r"(\d{1,2})\s*(?:\+|plus)?\s*(?:(?:-|to)\s*\d{1,2}\s*)?(?:years|yrs)", re.IGNORECASE)

START_WORDS = ("experience", "employment", "work history")
STOP_WORDS = ("education", "projects", "skills", "awards", "achievements",
              "certifications", "languages", "summary", "objective", "interests")


def _is_heading(line, words):
    line = line.strip().lower()
    return 0 < len(line.split()) <= 4 and any(w in line for w in words)


def _experience_section(text):
    lines = text.splitlines()
    start = next((i for i, l in enumerate(lines) if _is_heading(l, START_WORDS)), None)
    if start is None:
        return ""
    end = next((i for i in range(start + 1, len(lines))
                if _is_heading(lines[i], STOP_WORDS)), len(lines))
    return "\n".join(lines[start + 1:end])


def _to_number(month, year):
    return int(year) + ((int(month) - 1) / 12 if month else 0)


def _years_from_dates(section):
    today = date.today()
    now = today.year + (today.month - 1) / 12
    spans = []
    for m1, y1, m2, y2, word in RANGE_RE.findall(section):
        start = _to_number(m1, y1)
        end = now if word else _to_number(m2, y2)
        if end > start:
            spans.append((start, end))
    spans.sort()
    total, current_end = 0.0, None
    for start, end in spans:
        if current_end is None or start > current_end:
            total += end - start
            current_end = end
        elif end > current_end:
            total += end - current_end
            current_end = end
    return total


def resume_years(text):
    from_dates = _years_from_dates(_experience_section(text))
    explicit = [int(n) for n in EXPLICIT_RE.findall(text)]
    return round(max([from_dates] + explicit), 1)


def required_years(jd):
    match = JD_YEARS_RE.search(jd or "")
    if match:
        return int(match.group(1))
    if re.search(r"\b(fresher|entry[- ]level|no experience)\b", jd or "", re.IGNORECASE):
        return 0
    return None


def compare(resume_text, jd_text):
    have, need = resume_years(resume_text), required_years(jd_text)
    if need is None:
        status, note = "not_specified", None
    elif have >= need:
        status, note = "meets", None
    else:
        status = "below"
        note = (f"The job asks for {need}+ years of experience and your resume shows "
                f"about {have}. Highlight relevant internships and projects.")
    return {"required_years": need, "resume_years": have, "status": status}, note