import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import ErrorBox from "../components/ErrorBox";
import ScoreLine from "../components/charts/ScoreLine";

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [name, setName] = useState(user.name);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [profileMsg, setProfileMsg] = useState({ ok: "", err: "" });
  const [pwMsg, setPwMsg] = useState({ ok: "", err: "" });

  useEffect(() => {
    api.get("/analyses").then((d) => setHistory(d.analyses)).catch(() => {});
  }, []);

  function onAuthError(err, setter) {
    if (err.status === 401) { logout(); navigate("/login"); return; }
    setter({ ok: "", err: err.message });
  }

  async function saveName(e) {
    e.preventDefault();
    setProfileMsg({ ok: "", err: "" });
    if (!name.trim()) return setProfileMsg({ ok: "", err: "Enter your name." });
    try {
      const res = await api.patch("/auth/profile", { name: name.trim() });
      setUser(res.user);
      setProfileMsg({ ok: "Profile updated.", err: "" });
    } catch (err) { onAuthError(err, setProfileMsg); }
  }

  async function savePassword(e) {
    e.preventDefault();
    setPwMsg({ ok: "", err: "" });
    if (!pw.current || !pw.next || !pw.confirm) return setPwMsg({ ok: "", err: "Fill in all the fields." });
    if (pw.next.length < 8) return setPwMsg({ ok: "", err: "New password must be at least 8 characters." });
    if (pw.next !== pw.confirm) return setPwMsg({ ok: "", err: "Passwords do not match." });
    try {
      await api.post("/auth/change-password", { current_password: pw.current, new_password: pw.next });
      setPw({ current: "", next: "", confirm: "" });
      setPwMsg({ ok: "Password changed.", err: "" });
    } catch (err) { onAuthError(err, setPwMsg); }
  }

  const scores = history.map((h) => h.score);
  const total = history.length;
  const avg = total ? (scores.reduce((a, b) => a + b, 0) / total).toFixed(1) : 0;
  const best = total ? Math.max(...scores) : 0;
  const last = total ? new Date(history[0].created_at).toLocaleDateString() : "-";

  return (
    <>
      <Navbar />
      <div className="page">
        <h1>My profile</h1>

        <div className="cols" style={{ marginBottom: 16 }}>
          <div className="card">
            <h3>{user.name}</h3>
            <p>{user.email}</p>
            <p>
              <span className="tag ok">{user.role}</span>{" "}
              {user.created_at && <>Member since {new Date(user.created_at).toLocaleDateString()}</>}
            </p>
            <form onSubmit={saveName} noValidate>
              <input className="input" style={{ marginBottom: 10 }} aria-label="Name"
                     value={name} onChange={(e) => setName(e.target.value)} />
              {profileMsg.err && <div style={{ marginBottom: 10 }}><ErrorBox message={profileMsg.err} /></div>}
              {profileMsg.ok && <div className="ok-box" style={{ marginBottom: 10 }}>{profileMsg.ok}</div>}
              <button className="btn" type="submit">Save name</button>
            </form>
          </div>

          <div className="card">
            <h3>Change password</h3>
            <form onSubmit={savePassword} noValidate>
              <input className="input" type="password" placeholder="Current password" aria-label="Current password"
                     style={{ marginBottom: 10 }} value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
              <input className="input" type="password" placeholder="New password (min 8 characters)" aria-label="New password"
                     style={{ marginBottom: 10 }} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
              <input className="input" type="password" placeholder="Confirm new password" aria-label="Confirm new password"
                     style={{ marginBottom: 10 }} value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
              {pwMsg.err && <div style={{ marginBottom: 10 }}><ErrorBox message={pwMsg.err} /></div>}
              {pwMsg.ok && <div className="ok-box" style={{ marginBottom: 10 }}>{pwMsg.ok}</div>}
              <button className="btn" type="submit">Change password</button>
            </form>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <h3>My activity</h3>
          <div className="mini">
            <div><b>{total}</b>Analyses</div>
            <div><b>{avg}%</b>Average score</div>
            <div><b>{best}%</b>Best score</div>
            <div><b>{last}</b>Last analysis</div>
          </div>
          {total > 0
            ? <ScoreLine scores={[...scores].reverse()} />
            : <p>No analyses yet. <Link to="/upload">Analyse your first resume</Link></p>}
        </div>

        {total > 0 && (
          <div className="card">
            <h3>My analyses</h3>
            <div className="table-wrap">
              <table className="tbl">
                <thead><tr><th>Job</th><th>Score</th><th>Date</th><th></th></tr></thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id}>
                      <td>{h.job_title || "-"}</td><td>{h.score}%</td>
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