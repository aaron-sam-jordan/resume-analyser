import { Link } from "react-router-dom";

export default function AuthLayout({ title, children, footer }) {
  return (
    <div className="auth-page">
      <Link to="/" className="auth-home">← Home</Link>
      <div className="auth-card">
        <div className="auth-brand">Resume Analyser</div>
        <h1>{title}</h1>
        {children}
        <p className="auth-switch">{footer}</p>
      </div>
    </div>
  );
}