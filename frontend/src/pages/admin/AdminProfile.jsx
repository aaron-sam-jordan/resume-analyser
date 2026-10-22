import { AvatarCircle } from "../../components/Avatar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import AdminNav from "../../components/AdminNav";
import "../../styles/theme-admin.css";

export default function AdminProfile() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user.name);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [nameMsg, setNameMsg] = useState({ ok: "", err: "" });
  const [pwMsg, setPwMsg] = useState({ ok: "", err: "" });

  function onError(err, setter) {
    if (err.status === 401) { logout(); navigate("/"); return; }
    setter({ ok: "", err: err.message });
  }

  async function saveName(e) {
    e.preventDefault();
    setNameMsg({ ok: "", err: "" });
    if (!name.trim()) return setNameMsg({ ok: "", err: "Enter your name." });
    try {
      const res = await api.patch("/auth/profile", { name: name.trim() });
      setUser(res.user);
      setNameMsg({ ok: "Profile updated.", err: "" });
    } catch (err) { onError(err, setNameMsg); }
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
    } catch (err) { onError(err, setPwMsg); }
  }

  return (
    <div className="admin-page">
      <div className="in">
        <AdminNav />
        <h1>Admin profile</h1>

        <div className="a-grid">
          <div className="a-panel">
            <AvatarCircle name={user.name} large />
            <h3 style={{ marginTop: 10 }}>{user.name}</h3>
            <p>{user.email}</p>
            <p>
              <span className="a-tag ok">{user.role}</span>{" "}
              {user.created_at && <>Member since {new Date(user.created_at).toLocaleDateString()}</>}
            </p>
            <form onSubmit={saveName} noValidate>
              <input className="a-input" aria-label="Name" value={name} onChange={(e) => setName(e.target.value)} />
              {nameMsg.err && <div className="a-err" role="alert">{nameMsg.err}</div>}
              {nameMsg.ok && <div className="a-ok">{nameMsg.ok}</div>}
              <button className="a-btn" type="submit">Save name</button>
            </form>
          </div>

          <div className="a-panel">
            <h3>Change password</h3>
            <form onSubmit={savePassword} noValidate>
              <input className="a-input" type="password" placeholder="Current password" aria-label="Current password"
                     value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
              <input className="a-input" type="password" placeholder="New password (min 8 characters)" aria-label="New password"
                     value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
              <input className="a-input" type="password" placeholder="Confirm new password" aria-label="Confirm new password"
                     value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
              {pwMsg.err && <div className="a-err" role="alert">{pwMsg.err}</div>}
              {pwMsg.ok && <div className="a-ok">{pwMsg.ok}</div>}
              <button className="a-btn" type="submit">Change password</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}