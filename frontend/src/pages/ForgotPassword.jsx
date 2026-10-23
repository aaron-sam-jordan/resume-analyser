import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import AuthLayout from "../components/AuthLayout";
import ErrorBox from "../components/ErrorBox";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function sendCode(e) {
    if (e) e.preventDefault();
    setError("");
    setInfo("");
    if (!email.trim()) return setError("Enter your email.");
    setBusy(true);
    try {
      const res = await api.post("/auth/forgot-password", { email: email.trim() });
      setInfo(res.message);
      setStep(2);
      setCooldown(60);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!/^\d{6}$/.test(otp)) return setError("Enter the 6-digit code.");
    if (pw.length < 8) return setError("Password must be at least 8 characters.");
    if (pw !== confirm) return setError("Passwords do not match.");
    setBusy(true);
    try {
      await api.post("/auth/reset-password", { email: email.trim(), otp, new_password: pw });
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const back = <>Remembered it? <Link to="/login">Back to login</Link></>;

  if (step === 3) {
    return (
      <AuthLayout title="All set" footer={back}>
        <div className="ok-box" style={{ marginBottom: 14 }}>Your password has been reset.</div>
        <button className="btn" onClick={() => navigate("/login")}>Go to login</button>
      </AuthLayout>
    );
  }

  if (step === 2) {
    return (
      <AuthLayout title="Enter the code" footer={back}>
        {info && <div className="ok-box" style={{ marginBottom: 12, fontSize: 13 }}>{info}</div>}
        <ErrorBox message={error} />
        <form onSubmit={resetPassword} noValidate>
          <input className="input otp-input" inputMode="numeric" autoComplete="one-time-code" maxLength={6}
                 placeholder="------" aria-label="6-digit code" value={otp}
                 onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} />
          <input className="input" type="password" placeholder="New password (min 8 characters)" aria-label="New password"
                 value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" />
          <input className="input" type="password" placeholder="Confirm new password" aria-label="Confirm new password"
                 value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
          <button className="btn" type="submit" disabled={busy}>{busy ? "Resetting..." : "Reset password"}</button>
        </form>
        <p className="auth-switch">
          {cooldown > 0
            ? `Resend code in ${cooldown}s`
            : <button type="button" className="link-btn" onClick={sendCode}>Resend code</button>}
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot password" footer={back}>
      <p style={{ fontSize: 14, marginBottom: 12 }}>Enter your email and we will send you a 6-digit code.</p>
      <ErrorBox message={error} />
      <form onSubmit={sendCode} noValidate>
        <input className="input" type="email" placeholder="Email ID" aria-label="Email ID"
               value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        <button className="btn" type="submit" disabled={busy}>{busy ? "Sending..." : "Send code"}</button>
      </form>
    </AuthLayout>
  );
}