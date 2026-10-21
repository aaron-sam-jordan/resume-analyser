import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Line, Bar } from "react-chartjs-2";
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
  title: { display: !!title, text: title, color: LIGHT },
});
const opts = (xTitle, yTitle, extra = {}) => ({
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { x: axis(xTitle), y: axis(yTitle) },
  ...extra,
});

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [error, setError] = useState("");

  function handleErr(err) {
    if (err.status === 401) { logout(); navigate("/"); return; }
    setError(err.message);
  }

  function load() {
    Promise.all([api.get("/admin/stats"), api.get("/admin/users"), api.get("/admin/analyses")])
      .then(([s, u, a]) => { setStats(s); setUsers(u.users); setAnalyses(a.analyses); })
      .catch(handleErr);
  }

  useEffect(() => { load(); }, []);

  async function toggleBlock(u) {
    try { await api.patch(`/admin/users/${u.id}/block`); load(); } catch (e) { handleErr(e); }
  }

  async function removeUser(u) {
    if (!window.confirm(`Delete ${u.name} and all their analyses? This cannot be undone.`)) return;
    try { await api.del(`/admin/users/${u.id}`); load(); } catch (e) { handleErr(e); }
  }

  if (!stats && !error) return <div className="admin-page">Loading...</div>;

  return (
    <div className="admin-page">
      <div className="in">
        <div className="a-bar">
          <h1>Admin Dashboard</h1>
          <span>{user.email} <button className="a-btn" onClick={() => { logout(); navigate("/"); }}>Logout</button></span>
        </div>
        {error && <div className="a-err" role="alert">{error}</div>}

        {stats && (
          <>
            <div className="a-kpis">
              <div className="a-kpi"><b>{stats.total_users}</b>Total users</div>
              <div className="a-kpi"><b>{stats.total_analyses}</b>Resumes analysed</div>
              <div className="a-kpi"><b>{stats.average_score}%</b>Average match score</div>
              <div className="a-kpi"><b>{stats.blocked_users}</b>Blocked users</div>
            </div>

            <div className="a-grid">
              <div className="a-panel"><h3>Analyses per day</h3><div className="a-chart">
                <Line data={{ labels: stats.analyses_per_day.map((d) => d.date.slice(5)),
                  datasets: [{ data: stats.analyses_per_day.map((d) => d.total), borderColor: "#3ddbb4", backgroundColor: "#3ddbb433", fill: true, tension: 0.3 }] }}
                  options={opts("Date", "Analyses")} /></div></div>
              <div className="a-panel"><h3>Score distribution</h3><div className="a-chart">
                <Bar data={{ labels: Object.keys(stats.score_distribution),
                  datasets: [{ data: Object.values(stats.score_distribution), backgroundColor: "#ffb84d" }] }}
                  options={opts("Match score (%)", "Number of analyses")} /></div></div>
              <div className="a-panel"><h3>Most missing skills</h3><div className="a-chart">
                <Bar data={{ labels: stats.most_missing_skills.map((s) => s.skill),
                  datasets: [{ data: stats.most_missing_skills.map((s) => s.count), backgroundColor: "#ff8a80" }] }}
                  options={opts("Times missing", "", { indexAxis: "y" })} /></div></div>
            </div>
          </>
        )}

        <div className="a-panel">
          <h3>Users (click a name to open their activity page)</h3>
          <div className="a-scroll"><table>
            <thead><tr><th>Name</th><th>Email</th><th>Analyses</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td><Link className="a-link" to={`/admin/users/${u.id}`}>{u.name}</Link></td>
                  <td>{u.email}</td>
                  <td>{u.analyses_count}</td>
                  <td><span className={`a-tag ${u.is_blocked ? "bl" : "ok"}`}>{u.is_blocked ? "Blocked" : "Active"}</span></td>
                  <td>
                    {u.role === "admin" ? "Admin" : (
                      <>
                        <button className="a-btn" onClick={() => toggleBlock(u)}>{u.is_blocked ? "Unblock" : "Block"}</button>
                        <button className="a-btn del" onClick={() => removeUser(u)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>

        <div className="a-panel">
          <h3>Recent analyses</h3>
          <div className="a-scroll"><table>
            <thead><tr><th>User</th><th>Job</th><th>Date</th><th>Score</th><th>Missing skills</th></tr></thead>
            <tbody>
              {analyses.map((a) => (
                <tr key={a.id}>
                  <td>{a.user_name}</td><td>{a.job_title || "-"}</td><td>{fmt(a.created_at)}</td>
                  <td>{a.score}%</td><td>{a.missing_skills.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      </div>
    </div>
  );
}