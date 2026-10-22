import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function initials(name) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function AvatarCircle({ name, large }) {
  return <span className={`avatar ${large ? "avatar-lg" : ""}`} aria-hidden="true">{initials(name)}</span>;
}

export default function Avatar({ variant = "user" }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!user) return null;
  const isAdmin = user.role === "admin";

  return (
    <div className={`avatar-wrap ${variant}`} ref={ref}>
      <button type="button" className="avatar" aria-haspopup="menu" aria-expanded={open}
              aria-label="Account menu" onClick={() => setOpen(!open)}>
        {initials(user.name)}
      </button>
      {open && (
        <div className="avatar-menu" role="menu">
          <div className="avatar-info"><b>{user.name}</b><span>{user.email}</span></div>
          <Link role="menuitem" to={isAdmin ? "/admin/profile" : "/profile"} onClick={() => setOpen(false)}>Profile</Link>
          <Link role="menuitem" to={isAdmin ? "/admin" : "/upload"} onClick={() => setOpen(false)}>
            {isAdmin ? "Dashboard" : "Analyse a resume"}
          </Link>
          <button type="button" role="menuitem" onClick={() => { setOpen(false); logout(); navigate("/"); }}>Logout</button>
        </div>
      )}
    </div>
  );
}