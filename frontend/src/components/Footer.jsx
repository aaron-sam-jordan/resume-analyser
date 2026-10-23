import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function backToTop() {
  const opts = { top: 0, behavior: "smooth" };
  window.scrollTo(opts);
  document.documentElement.scrollTo(opts);
  document.body.scrollTo(opts);
  const page = document.querySelector(".land");
  if (page) page.scrollTo(opts);
}


export default function Footer() {
  const { user } = useAuth();
  const isAdmin = user && user.role === "admin";
  const dash = user ? (isAdmin ? "/admin" : "/upload") : "/register";

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo"><i>+</i> Resume Analyser</div>
          <p>Match your resume to any job. See your score, your missing skills and what to improve, in seconds.</p>
          <Link className="btn lime" to={dash}>{user ? "Go to dashboard" : "Get started"} →</Link>
        </div>

        <div>
          <h4>Product</h4>
          <ul>
            <li><a href="/#how">How it works</a></li>
            <li><a href="/#features">Features</a></li>
            <li><a href="/#privacy">Privacy</a></li>
            <li><Link to="/about">About us</Link></li>
            <li><Link to={dash}>Analyse a resume</Link></li>
          </ul>
        </div>

        <div>
          <h4>Account</h4>
          <ul>
            {user ? (
              <>
                <li><Link to={isAdmin ? "/admin/profile" : "/profile"}>Profile</Link></li>
                <li><Link to={dash}>{isAdmin ? "Dashboard" : "My analyses"}</Link></li>
              </>
            ) : (
              <>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
              </>
            )}
            <li><Link to="/">Home</Link></li>
          </ul>
        </div>

        <div>
          <h4>Built with</h4>
          <ul>
            <li>React</li>
            <li>Flask</li>
            <li>SQL Server</li>
            <li>scikit-learn</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Resume Analyser. All rights reserved.</span>
        <span>Your resume is never stored.</span>
        <button type="button" onClick={backToTop}>Back to top ↑</button>
      </div>
      <div className="footer-mark" aria-hidden="true">Resume Analyser</div>
    </footer>
  );
}