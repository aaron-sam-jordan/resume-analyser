import { Link } from "react-router-dom";

export default function AuthLayout({ title, children, footer }) {
  return (
    <div className="auth-page">
      <Link to="/" style={{ position: "absolute", top: 14, left: 16, color: "#fff", fontWeight: 600, zIndex: 2 }}>
        ← Home
      </Link>
      <span className="sticker s1">Python ✔</span>
      <span className="sticker s2">92% match</span>
      <span className="sticker s3">SQL ✘</span>
      <span className="sticker s4">Git ✔</span>
      <div className="auth-card">
        <h1>{title}</h1>
        {children}
        <p className="auth-switch">{footer}</p>
      </div>
    </div>
  );
}