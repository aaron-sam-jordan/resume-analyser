import re
from services.cleaner import normalize

CATEGORIES = ["Programming", "Database", "Web", "ML", "Data", "Tools"]

SYNONYMS = {
    "ml": "Machine Learning",
    "dl": "Deep Learning",
    "natural language processing": "NLP",
    "js": "JavaScript",
    "reactjs": "React",
    "react.js": "React",
    "html5": "HTML",
    "css3": "CSS",
    "postgres": "PostgreSQL",
    "mongo": "MongoDB",
    "mssql": "SQL Server",
    "ms sql server": "SQL Server",
    "microsoft sql server": "SQL Server",
    "sklearn": "Scikit-learn",
    "scikit learn": "Scikit-learn",
    "tensor flow": "TensorFlow",
    "powerbi": "Power BI",
    "ms excel": "Excel",
    "microsoft excel": "Excel",
    "restful api": "REST API",
    "restful apis": "REST API",
    "rest apis": "REST API",
}

SUGGESTIONS = {
    "Programming": "Add a project that shows your {skill} skills.",
    "Database": "Add a project or coursework that uses {skill}.",
    "Web": "Build a small project with {skill} and add it to your Projects section.",
    "ML": "Add one {skill} project with results to your Projects section.",
    "Data": "Mention {skill} in your Skills section and show it in a project.",
    "Tools": "Add {skill} to your Skills section and use it in a project.",
}

_ALIAS_PATTERNS = [
    (re.compile(rf"(?<![a-z0-9+#.]){re.escape(alias)}(?![a-z0-9+#])(?!\.[a-z0-9])"),
     normalize(canonical))
    for alias, canonical in SYNONYMS.items()
]


def expand_synonyms(text):
    for pattern, replacement in _ALIAS_PATTERNS:
        text = pattern.sub(replacement, text)
    return text


def suggestion_for(skill, category):
    template = SUGGESTIONS.get(category, "Add {skill} to your resume.")
    return template.format(skill=skill)