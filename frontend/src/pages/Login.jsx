import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import ErrorBox from "../components/ErrorBox";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={user.role === "admin" ? "/admin" : "/upload"} replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setBusy(true);
    try {
      const loggedIn = await login(email.trim(), password);
      navigate(loggedIn.role === "admin" ? "/admin" : "/upload", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Login"
      footer={<>Don't have an account? <Link to="/register">Register</Link></>}
    >
      <ErrorBox message={error} />
      <form onSubmit={handleSubmit} noValidate>
        <input className="input" type="email" placeholder="Email ID" aria-label="Email ID"
               value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        <input className="input" type="password" placeholder="Password" aria-label="Password"
               value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Logging in..." : "Login"}
        </button>
      </form>
    </AuthLayout>
  );
}