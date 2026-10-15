import os
import re
from config import Config

ALLOWED_EXTENSIONS = {".pdf", ".docx"}
MAX_BYTES = Config.MAX_UPLOAD_MB * 1024 * 1024
MIN_JD_WORDS = 30
MIN_TEXT_CHARS = 100

SECTION_WORDS = ["education", "experience", "skills", "projects",
                 "summary", "objective", "certifications", "internship"]
EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
LINK_RE = re.compile(r"linkedin|github", re.IGNORECASE)
PHONE_RE = re.compile(r"\+?\d[\d\s\-().]{8,}\d")


def check_file(file):
    if file is None or file.filename == "":
        return "Please upload your resume."

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return "Only PDF or DOCX files are allowed."

    file.stream.seek(0, os.SEEK_END)
    size = file.stream.tell()
    file.stream.seek(0)
    if size == 0:
        return "This file is empty."
    if size > MAX_BYTES:
        return f"File is too large. The limit is {Config.MAX_UPLOAD_MB} MB."

    header = file.stream.read(4)
    file.stream.seek(0)
    if ext == ".pdf" and header != b"%PDF":
        return "This is not a real PDF file."
    if ext == ".docx" and header != b"PK\x03\x04":
        return "This is not a real DOCX file."

    return None


def check_jd(jd):
    words = (jd or "").split()
    if not words:
        return "Please paste the job description."
    if len(words) < MIN_JD_WORDS:
        return f"The job description is too short. Add at least {MIN_JD_WORDS} words."
    return None


def check_resume_text(text):
    if len((text or "").strip()) < MIN_TEXT_CHARS:
        return "No readable text found. This may be a scanned PDF. Please upload a text-based file."

    lower = text.lower()
    sections = sum(1 for w in SECTION_WORDS if re.search(rf"\b{w}\b", lower))
    has_contact = bool(EMAIL_RE.search(text) or PHONE_RE.search(text) or LINK_RE.search(text))
    if sections < 2 or not has_contact:
        return "This does not look like a resume. It needs sections like Education or Skills, and an email or phone number."

    return None

LONG_RESUME_SCORE = 10


def length_rule(page_count):
    if page_count is None or page_count <= 1:
        return None, None
    if page_count == 2:
        return ("Your resume is 2 pages. HR prefers 1 page, "
                "so try to cut it down to one."), None
    return (f"Your resume is {page_count} pages. A resume should be "
            f"at most 1 page, not {page_count}."), LONG_RESUME_SCORE