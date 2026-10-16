import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import ErrorBox from "../components/ErrorBox";

export default function Register() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={user.role === "admin" ? "/admin" : "/upload"} replace />;

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.confirm) {
      setError("Fill in all the fields.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await api.post("/auth/register", {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      await login(form.email.trim(), form.password);
      navigate("/upload", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Register"
      footer={<>Already have an account? <Link to="/login">Login</Link></>}
    >
      <ErrorBox message={error} />
      <form onSubmit={handleSubmit} noValidate>
        <input className="input" type="text" placeholder="Full name" aria-label="Full name"
               value={form.name} onChange={set("name")} autoComplete="name" />
        <input className="input" type="email" placeholder="Email ID" aria-label="Email ID"
               value={form.email} onChange={set("email")} autoComplete="email" />
        <input className="input" type="password" placeholder="Password (min 8 characters)" aria-label="Password"
               value={form.password} onChange={set("password")} autoComplete="new-password" />
        <input className="input" type="password" placeholder="Confirm password" aria-label="Confirm password"
               value={form.confirm} onChange={set("confirm")} autoComplete="new-password" />
        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Creating..." : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}