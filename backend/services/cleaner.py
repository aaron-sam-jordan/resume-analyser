import re
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS
from services.validator import EMAIL_RE, PHONE_RE

URL_RE = re.compile(r"https?://\S+|www\.\S+")

RESUME_NOISE = {
    "email", "phone", "mobile", "contact", "address", "linkedin",
    "github", "references", "available", "upon", "request", "page",
}


def normalize(text):
    text = (text or "").lower()
    text = URL_RE.sub(" ", text)
    text = EMAIL_RE.sub(" ", text)
    text = PHONE_RE.sub(" ", text)
    text = re.sub(r"[^a-z0-9+#.\s]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def tokenize(text):
    tokens = [t.strip(".") for t in normalize(text).split()]
    return [
        t for t in tokens
        if len(t) > 1
        and not t.isdigit()
        and t not in ENGLISH_STOP_WORDS
        and t not in RESUME_NOISE
    ]


def clean_text(text):
    return " ".join(tokenize(text))