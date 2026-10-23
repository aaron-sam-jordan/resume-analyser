import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";

const TOP = ["Skill match", "TF-IDF similarity", "Experience check", "Private by design", "Resume in, insights out"];
const SKILLS = ["Python", "SQL", "Pandas", "Power BI", "Tableau", "Statistics", "Machine Learning", "Excel", "Git"];

function Marquee({ items, className }) {
  const row = [...items, ...items];
  return (
    <div className={className} aria-hidden="true">
      <div className="track">{row.map((t, i) => <span key={i}>{t}</span>)}</div>
    </div>
  );
}

function Stage() {
  return (
    <div className="stage" role="img" aria-label="Sample resume with matched skills highlighted, a 52 percent match score and 5 of 8 skills matched">
      <span className="ring r1" />
      <span className="ring r2" />
      <div className="sheet">
        <i className="scan" />
        <div className="sheet-name">ANANYA RAO</div>
        <div className="sheet-role">Data Analyst · 3 yrs · Bengaluru</div>
        <div className="sheet-label">Skills</div>
        <p><mark>Python</mark> · <mark>SQL</mark> · <mark>Pandas</mark> · <mark>Excel</mark> · <mark>Power BI</mark></p>
        <div className="sheet-label">Experience</div>
        <p>Cleaned datasets with <mark>Python</mark> and <mark>Pandas</mark>, wrote <mark>SQL</mark> reports and built <mark>Power BI</mark> dashboards.</p>
        <span className="bar w90" /><span className="bar w70" /><span className="bar w80" />
        <div className="sheet-label">Projects</div>
        <p>Sales analysis in <mark>Excel</mark> and <mark>SQL</mark>.</p>
        <span className="bar w55" />
      </div>
      <div className="badge"><b>52%</b><span>MATCH SCORE</span></div>
      <div className="badge2"><b>5/8</b><span>SKILLS</span></div>
      <span className="float no f1">Tableau ✗</span>
      <span className="float no f2">Machine Learning ✗</span>
      <span className="float ok f3">Python ✓</span>
      <span className="float ok f4">Eligible ✓ </span>
      <div className="stage-cap">Sample result</div>
    </div>
  );
}

export default function Landing() {
  const { user } = useAuth();
  const dash = user ? (user.role === "admin" ? "/admin" : "/upload") : "/register";

  return (
    <div className="land">
      <Marquee items={TOP} className="land-topbar" />

      <header className="land-nav">
        <div className="land-logo"><i>+</i> Resume Analyser</div>
        <nav className="land-links" aria-label="Sections">
          <Link to="/">Home</Link>
          <a href="#how">How it works</a>
          <a href="#features">Features</a>
          <a href="#privacy">Privacy</a>
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

      <section className="land-hero">
        <div>
          <div className="kicker">Skills · Keywords · Experience<br />Page length · Know your match</div>
          <h1 className="land-title">Resume<br /><span className="hl">Analyser</span></h1>
          <p className="land-tag">Match-ready resumes, before the recruiter sees them.</p>
          <p className="land-copy">
            Upload your resume, paste a job description, and see your match score, the skills you are missing and exactly what to improve.
          </p>
          <div className="land-cta-row">
            <Link className="btn" to={dash}>{user ? "Go to dashboard" : "Analyse my resume"} →</Link>
            <a className="btn ghost" href="#how">How it works</a>
          </div>
          <div className="land-facts">
            <div><b>70/30</b><span>Skills to text score</span></div>
            <div><b>8</b><span>Checks before analysis</span></div>
            <div><b>0</b><span>Resumes stored</span></div>
          </div>
        </div>
        <Stage />
      </section>

      <Marquee items={SKILLS} className="land-marquee" />

      <section className="land-section" id="how">
        <h2>How it works</h2>
        <div className="steps">
          <div className="step"><div className="num">01</div><h3>Upload</h3><p>Add your resume as a PDF or DOCX file.</p></div>
          <div className="step"><div className="num">02</div><h3>Paste the job</h3><p>Paste the job description you are applying for.</p></div>
          <div className="step"><div className="num">03</div><h3>Get your score</h3><p>See matched and missing skills, charts and clear suggestions.</p></div>
        </div>
      </section>

      <section className="land-section" id="features" style={{ paddingTop: 0 }}>
        <h2>What you get</h2>
        <div className="bento">
          <div className="b b1">
            <div>
              <small>01 · Skill matching</small>
              <h3>Know exactly what is missing</h3>
              <p>Checks the skills a job needs against your resume, including short forms like ML.</p>
            </div>
            <div style={{ marginTop: 18 }}>
              <span className="chip ok">Python</span><span className="chip ok">SQL</span><span className="chip ok">Pandas</span>
              <span className="chip no">Tableau</span><span className="chip no">Statistics</span>
            </div>
          </div>
          <div className="b b2">
            <div><small>02 · Text similarity</small><h3>Wording that fits</h3>
              <p>TF-IDF and cosine similarity measure how close your resume is to the job post.</p></div>
          </div>
          <div className="b b3" id="privacy">
            <div><small>03 · Private by design</small><h3>Never stored</h3>
              <p>Resumes are read in memory. Admins only see scores, never the file.</p></div>
            <div className="big">0</div>
          </div>
          <div className="b b4"><div><small>04 · Experience</small><h3>Years check</h3><p>Compares your years of experience with what the job asks for.</p></div></div>
          <div className="b b5"><div><small>05 · Insight</small><h3>Charts and history</h3><p>Doughnut, bar and line charts across your attempts.</p></div></div>
          <div className="b b6"><div><small>06 · Admin</small><h3>Usage insights</h3><p>Stats, missing skills and per-user activity.</p></div></div>
        </div>
      </section>

      <section className="land-cta">
        <h2>Ready to improve your resume?</h2>
        <Link className="btn lime" to={dash}>{user ? "Go to dashboard" : "Create a free account"} →</Link>
      </section>
      <Footer />
    </div>
  );
}