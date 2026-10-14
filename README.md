# Resume Analyser

A web app that compares a resume with a job description and shows a match
score, matched skills, missing skills and suggestions.

## Tech's involved
- Backend: Python, Flask, pyodbc (SQL Server)
- Frontend: React (Vite)
- Analysis: pdfplumber, scikit-learn (TF-IDF, cosine similarity)

## Setup (backend)
1. `cd backend`
2. `python -m venv venv` then activate it
3. `pip install -r requirements.txt`
4. Copy `.env.example` to `.env` and fill in your values
5. Create the database and tables in SQL Server (`db/schema.sql`)
6. `python app.py`

## Status
In development.