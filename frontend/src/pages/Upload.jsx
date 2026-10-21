import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import ErrorBox from "../components/ErrorBox";

const MAX_MB = 5;

export default function Upload() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.get("/analyses").then((d) => setHistory(d.analyses)).catch(() => {});
  }, []);

  const words = jd.trim() ? jd.trim().split(/\s+/).length : 0;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!file) return setError("Please upload your resume.");
    const name = file.name.toLowerCase();
    if (!name.endsWith(".pdf") && !name.endsWith(".docx")) return setError("Only PDF or DOCX files are allowed.");
    if (file.size > MAX_MB * 1024 * 1024) return setError(`File is too large. The limit is ${MAX_MB} MB.`);
    if (words === 0) return setError("Please paste the job description.");
    if (words < 30) return setError("The job description is too short. Add at least 30 words.");

    const form = new FormData();
    form.append("resume", file);
    form.append("jd", jd);
    form.append("job_title", title);

    setBusy(true);
    try {
      const result = await api.upload("/analyse", form);
      navigate(`/result/${result.id}`);
    } catch (err) {
      if (err.status === 401) { logout(); navigate("/login"); return; }
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="page">
        <h1>Analyse your resume</h1>
        <p>Upload your resume, paste the job you want, and see how well they match.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="cols">
            <div className="card">
              <h3>Your resume</h3>
              <label
                className={`drop ${over ? "over" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setOver(true); }}
                onDragLeave={() => setOver(false)}
                onDrop={(e) => { e.preventDefault(); setOver(false); if (e.dataTransfer.files.length) setFile(e.dataTransfer.files[0]); }}
              >
                <b>Drop your resume here</b>
                <small>PDF or DOCX, up to {MAX_MB} MB</small>
                <span className="btn">Browse files</span>
                <input type="file" accept=".pdf,.docx" aria-label="Upload resume file"
                       onChange={(e) => setFile(e.target.files[0] || null)} />
              </label>
              {file && <div className="file-card">{file.name} ({(file.size / 1024).toFixed(0)} KB)</div>}
            </div>

            <div className="card">
              <h3>Job description</h3>
              <input className="input" style={{ marginBottom: 10 }} placeholder="Job title (optional)"
                     aria-label="Job title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <textarea className="input" placeholder="Paste the full job description here, including the required skills."
                        aria-label="Job description" value={jd} onChange={(e) => setJd(e.target.value)} />
              <div className="count"><span>{words} words</span><span>At least 30 words</span></div>
            </div>
          </div>

          <div style={{ marginTop: 16 }}><ErrorBox message={error} /></div>
          <div style={{ marginTop: 16 }}>
            <button className="btn" type="submit" disabled={busy}>{busy ? "Analysing..." : "Analyse resume"}</button>
          </div>
        </form>

        {history.length > 0 && (
          <div className="card" style={{ marginTop: 24 }}>
            <h3>Your past analyses</h3>
            <div className="table-wrap">
              <table className="tbl">
                <thead><tr><th>Job</th><th>Score</th><th>Date</th><th></th></tr></thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id}>
                      <td>{h.job_title || "-"}</td>
                      <td>{h.score}%</td>
                      <td>{new Date(h.created_at).toLocaleDateString()}</td>
                      <td><Link to={`/result/${h.id}`}>View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}