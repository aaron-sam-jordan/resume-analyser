import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Line } from "react-chartjs-2";
import "../../components/charts/setup";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import "../../styles/theme-admin.css";

const LIGHT = "#bfeee3";
const GRID = "#1c6b5f";
const fmt = (d) => (d ? new Date(d).toLocaleDateString() : "-");
const axis = (title) => ({
  beginAtZero: true,
  ticks: { color: LIGHT, precision: 0 },
  grid: { color: GRID },
  title: { display: true, text: title, color: LIGHT },
});

export default function UserDetail() {
  const { id } = useParams();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  function handleErr(err) {
    if (err.status === 401) { logout(); navigate("/"); return; }
    setError(err.message);
  }

  function load() {
    api.get(`/admin/users/${id}`).then(setData).catch(handleErr);
  }

  useEffect(() => { setData(null); setError(""); load(); }, [id]);

  async function toggleBlock() {
    try { await api.patch(`/admin/users/${id}/block`); load(); } catch (e) { handleErr(e); }
  }

  async function remove() {
    if (!window.confirm("Delete this user and all their analyses? This cannot be undone.")) return;
    try { await api.del(`/admin/users/${id}`); navigate("/admin"); } catch (e) { handleErr(e); }
  }

  if (error) {
    return (
      <div className="admin-page"><div className="in">
        <div className="a-err" role="alert">{error}</div>
        <Link className="a-link" to="/admin">← Back to dashboard</Link>
      </div></div>
    );
  }
  if (!data) return <div className="admin-page">Loading...</div>;

  const { user, summary, history, analyses } = data;

  return (
    <div className="admin-page">
      <div className="in">
        <p><Link className="a-link" to="/admin">← Back to dashboard</Link></p>

        <div className="a-bar">
          <h1>{user.name}</h1>
          <span className={`a-tag ${user.is_blocked ? "bl" : "ok"}`}>{user.is_blocked ? "Blocked" : "Active"}</span>
        </div>
        <p>{user.email} · {user.role} · joined {fmt(user.created_at)}</p>

        {user.role !== "admin" && (
          <p>
            <button className="a-btn" onClick={toggleBlock}>{user.is_blocked ? "Unblock" : "Block"}</button>
            <button className="a-btn del" onClick={remove}>Delete user</button>
          </p>
        )}

        <div className="a-kpis">
          <div className="a-kpi"><b>{summary.total_analyses}</b>Analyses</div>
          <div className="a-kpi"><b>{summary.average_score}%</b>Average score</div>
          <div className="a-kpi"><b>{summary.best_score}%</b>Best score</div>
          <div className="a-kpi"><b style={{ fontSize: 20 }}>{fmt(summary.last_active)}</b>Last active</div>
        </div>

        {summary.top_missing_skills.length > 0 && (
          <div className="a-panel">
            <h3>Needs to work on</h3>
            {summary.top_missing_skills.map((s) => <span key={s.skill} className="a-chip no">{s.skill} ({s.count})</span>)}
          </div>
        )}

        {history.length > 0 && (
          <div className="a-panel">
            <h3>Score over attempts</h3>
            <div className="a-chart">
              <Line
                data={{ labels: history.map((h, i) => `Attempt ${i + 1}`),
                  datasets: [{ data: history.map((h) => h.score), borderColor: "#ffb84d", backgroundColor: "#ffb84d33", fill: true, tension: 0.3 }] }}
                options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
                  scales: { x: axis("Attempt"), y: { ...axis("Score (%)"), max: 100 } } }} />
            </div>
          </div>
        )}

        <div className="a-panel">
          <h3>All analyses</h3>
          <div className="a-scroll">
            <table>
              <thead><tr><th>Job</th><th>Date</th><th>Score</th><th>Matched</th><th>Missing</th></tr></thead>
              <tbody>
                {analyses.length === 0 && <tr><td colSpan="5">No analyses yet.</td></tr>}
                {analyses.map((a) => (
                  <tr key={a.id}>
                    <td>{a.job_title || "-"}</td><td>{fmt(a.created_at)}</td><td>{a.score}%</td>
                    <td>{a.matched_skills.map((s) => <span key={s} className="a-chip ok">{s}</span>)}</td>
                    <td>{a.missing_skills.map((s) => <span key={s} className="a-chip no">{s}</span>)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}