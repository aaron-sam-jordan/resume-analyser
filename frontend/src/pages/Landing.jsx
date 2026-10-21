import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Landing() {
  const { user } = useAuth();
  const home = user ? (user.role === "admin" ? "/admin" : "/upload") : "/register";

  return (
    <div>
      <header className="land-nav">
        <b>Resume Analyser</b>
        <span>
          {user ? (
            <>
              <Link to={user.role === "admin" ? "/admin" : "/upload"}>Dashboard</Link>
              <Link to={user.role === "admin" ? "/admin/profile" : "/profile"}>Profile</Link>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link className="btn" to="/register">Get started</Link>
            </>
          )}
        </span>
      </header>

      <section className="land-hero">
        <span className="sticker s1">Python ✔</span>
        <span className="sticker s2">92% match</span>
        <span className="sticker s3">SQL ✘</span>
        <span className="sticker s4">Git ✔</span>
        <h1>See how well your resume matches the job</h1>
        <p>Upload your resume, paste a job description, and get a match score, your missing skills and clear suggestions.</p>
        <Link className="btn" to={home}>{user ? "Go to dashboard" : "Analyse my resume"}</Link>
        {!user && <Link className="btn" to="/login" style={{ background: "#fff" }}>Login</Link>}
      </section>

      <section className="land-section">
        <h2>How it works</h2>
        <div className="steps">
          <div className="card"><span className="step-num">1</span><h3>Upload</h3>
            <p>Upload your resume as a PDF or DOCX file.</p></div>
          <div className="card"><span className="step-num">2</span><h3>Paste the job</h3>
            <p>Paste the job description you are applying for.</p></div>
          <div className="card"><span className="step-num">3</span><h3>Get your score</h3>
            <p>See your match score, matched and missing skills, and what to improve.</p></div>
        </div>
      </section>

      <section className="land-section">
        <h2>What you get</h2>
        <div className="feat">
          <div className="card"><h3>Skill matching</h3><p>Checks the skills the job needs against your resume, including short forms like ML.</p></div>
          <div className="card"><h3>Text similarity</h3><p>TF-IDF and cosine similarity measure how close your wording is to the job.</p></div>
          <div className="card"><h3>Resume checks</h3><p>Page length rule, experience years check, and section detection.</p></div>
          <div className="card"><h3>Charts and history</h3><p>Doughnut, bar and line charts, and your score across attempts.</p></div>
          <div className="card"><h3>Privacy first</h3><p>Your resume is read in memory and never stored on the server.</p></div>
          <div className="card"><h3>Secure accounts</h3><p>JWT login with user and admin roles, and a monitoring dashboard for admins.</p></div>
        </div>
      </section>

      <div className="land-cta">
        <h2>Ready to improve your resume?</h2>
        <Link className="btn" to={home}>{user ? "Go to dashboard" : "Create a free account"}</Link>
      </div>
      <footer className="land-foot">Resume Analyser · College final year project</footer>
    </div>
  );
}