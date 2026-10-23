import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";

// Optional: fill these in and the team section / contact line will appear automatically.
const TEAM = [
  // { name: "Your Name", role: "Full-stack developer" },
];
const CONTACT_EMAIL = "";

const TECH = ["React", "Flask", "SQL Server", "scikit-learn"];

const VALUES = [
  ["Honest", "Every resume is checked by the same rules, and we show you how the score was reached."],
  ["Private", "Resumes are read in memory and never stored. Admins only see scores, never the file."],
  ["Clear", "Missing skills and next steps, in plain words you can act on."],
  ["Progress", "Charts and history show how your resume improves across attempts."],
];

const initials = (name) => name.split(" ").filter(Boolean).map((p) => p[0]).slice(0, 2).join("").toUpperCase();

export default function About() {
  const { user } = useAuth();
  const dash = user ? (user.role === "admin" ? "/admin" : "/upload") : "/register";

  return (
    <div className="land">
      <header className="land-nav">
        <div className="land-logo"><i>+</i> Resume Analyser</div>
        <nav className="land-links" aria-label="Sections">
          <Link to="/">Home</Link>
          <a href="/#how">How it works</a>
          <a href="/#features">Features</a>
          <a href="/#privacy">Privacy</a>
          <Link to="/about">About</Link>
        </nav>
        <div className="land-right">
          {user ? (
            <>
              <Link to={dash}>Dashboard</Link>
              <Avatar variant={user.role === "admin" ? "admin" : "user"} />
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link className="btn ghost" to="/register">Get started</Link>
            </>
          )}
        </div>
      </header>

      <main className="page">
        <h1>About us</h1>
        <p style={{ maxWidth: 720, fontSize: 18, color: "var(--muted)", marginBottom: 24 }}>
          Resume Analyser helps job seekers see what a recruiter sees. Upload your resume, paste a job description, and get a clear score, the skills you are missing and what to improve.
        </p>

        <div className="cols" style={{ marginBottom: 16 }}>
          <div className="card">
            <h3>Why we built it</h3>
            <p>
              Recruiters often start with skills and keywords before a person reads a single line. Most job seekers never learn how well a resume fits a job until it is too late to change it. We built Resume Analyser to give that answer first.
            </p>
          </div>
          <div className="card">
            <h3>What we do</h3>
            <p>
              We read your resume (PDF or DOCX) and the job description, match skills one by one, and compare the wording with TF-IDF similarity. You get a score, matched and missing skills, charts and clear suggestions.
            </p>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <h3>How your score works</h3>
          <div className="mini">
            <div><b>70%</b>Skill match</div>
            <div><b>30%</b>Text similarity</div>
            <div><b>0</b>Resumes stored</div>
          </div>
          <p style={{ marginBottom: 0 }}>
            Your match score blends skill match with how closely your wording fits the job post. We also check your years of experience against what the job asks for.
          </p>
        </div>

        <h2 style={{ marginTop: 28 }}>What we stand for</h2>
        <div className="grid">
          {VALUES.map(([title, text]) => (
            <div className="card" key={title}>
              <h3>{title}</h3>
              <p style={{ marginBottom: 0 }}>{text}</p>
            </div>
          ))}
        </div>

        {TEAM.length > 0 && (
          <>
            <h2 style={{ marginTop: 12 }}>The team</h2>
            <div className="grid">
              {TEAM.map((m) => (
                <div className="card" key={m.name}>
                  <span className="avatar avatar-lg" aria-hidden="true">{initials(m.name)}</span>
                  <h3 style={{ marginTop: 12 }}>{m.name}</h3>
                  <p style={{ marginBottom: 0 }}>{m.role}</p>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="card" style={{ marginBottom: 16 }}>
          <h3>Built with</h3>
          <div>{TECH.map((t) => <span key={t} className="chip ok">{t}</span>)}</div>
          {CONTACT_EMAIL && (
            <p style={{ marginTop: 10, marginBottom: 0 }}>Questions or feedback? Write to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
          )}
        </div>

        <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>Ready to improve your resume?</h3>
          <Link className="btn" to={dash}>{user ? "Go to dashboard" : "Create a free account"} →</Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}