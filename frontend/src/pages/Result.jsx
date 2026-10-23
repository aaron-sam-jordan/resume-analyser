import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import ErrorBox from "../components/ErrorBox";
import SkillChip from "../components/SkillChip";
import ScoreSticker from "../components/ScoreSticker";
import MatchDoughnut from "../components/charts/MatchDoughnut";
import CategoryBar from "../components/charts/CategoryBar";
import ScoreLine from "../components/charts/ScoreLine";

export default function Result() {
  const { id } = useParams();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setData(null);
    Promise.all([api.get(`/analyses/${id}`), api.get("/analyses")])
      .then(([one, list]) => { setData(one); setHistory(list.analyses); })
      .catch((err) => {
        if (err.status === 401) { logout(); navigate("/login"); return; }
        setError(err.message);
      });
  }, [id]);

  if (error) {
    return (<><Navbar /><div className="page"><ErrorBox message={error} /><p><Link to="/upload">Back to upload</Link></p></div></>);
  }
  if (!data) return (<><Navbar /><div className="page">Loading...</div></>);

  const d = data.details || {};
  const exp = d.experience;
  const scores = [...history].reverse().map((h) => h.score);

  return (
    <>
      <Navbar />
      <div className="page">
        <h1>Resume Analysis Report</h1>
        <p>{data.job_title || "Job"} · {new Date(data.created_at).toLocaleString()}</p>

        <div className="hero">
          <ScoreSticker score={data.score} penalty={d.length_penalty} />
          <div className="card">
            <div className="mini">
              <div><b>{data.skill_score}%</b>Skill match</div>
              <div><b>{data.text_score}%</b>Text similarity</div>
              {d.page_count ? <div><b>{d.page_count}</b>Page(s)</div> : null}
            </div>
            {exp && exp.status !== "not_specified" && (
              <p>
                <span className={`tag ${exp.status === "meets" ? "ok" : "no"}`}>
                  Experience: {exp.status === "meets" ? "meets" : "below"}
                </span>{" "}
                Job asks {exp.required_years}+ years, resume shows about {exp.resume_years}.
              </p>
            )}
            <h3>Matched skills ({data.matched_skills.length})</h3>
            <div>{data.matched_skills.map((s) => <SkillChip key={s} name={s} ok />)}</div>
            <h3 style={{ marginTop: 10 }}>Missing skills ({data.missing_skills.length})</h3>
            <div>{data.missing_skills.map((s) => <SkillChip key={s} name={s} />)}</div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <h3>Suggestions</h3>
          <ul>{data.suggestions.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>

        <div className="grid">
          <div className="card"><h3>Matched vs missing</h3>
            <MatchDoughnut matched={data.matched_skills.length} missing={data.missing_skills.length} /></div>
          {d.categories && (
            <div className="card"><h3>Skills by category</h3><CategoryBar categories={d.categories} /></div>
          )}
          <div className="card wide"><h3>Your score over attempts</h3><ScoreLine scores={scores} /></div>
        </div>

        {d.top_keywords && d.top_keywords.length > 0 && (
          <div className="card" style={{ marginBottom: 16 }}>
            <h3>Top keywords in your resume</h3>
          <div>{d.top_keywords.map((k) => <span key={k.word} className="chip ok">{k.word}</span>)}</div>          </div>
        )}

        <Link className="btn" to="/upload" style={{ textDecoration: "none", display: "inline-block" }}>Analyse another</Link>
      </div>
      <Footer />
    </>
  );
}