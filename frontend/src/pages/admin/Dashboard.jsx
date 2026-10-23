import AdminNav from "../../components/AdminNav";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import "../../styles/theme-admin.css";

const fmt = (d) => (d ? new Date(d).toLocaleDateString() : "-");

export default function Dashboard() {
  const { logout } = useAuth();
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
        <AdminNav />
        <h1>Admin Dashboard</h1>
        {error && <div className="a-err" role="alert">{error}</div>}

        {stats && (
          <div className="a-kpis">
            <div className="a-kpi"><b>{stats.total_users}</b>Total users</div>
            <div className="a-kpi"><b>{stats.total_analyses}</b>Resumes analysed</div>
            <div className="a-kpi"><b>{stats.average_score}%</b>Average match score</div>
            <div className="a-kpi"><b>{stats.blocked_users}</b>Blocked users</div>
          </div>
        )}

        <div className="a-panel">
          <h3>Users</h3>
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