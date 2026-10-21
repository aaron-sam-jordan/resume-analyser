import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="nav">
      <b>Resume Analyser</b>
      <span>
        <Link to="/">Home</Link>
        <Link to="/upload">Analyse</Link>
        <Link to="/profile">Profile</Link>
        {user && (
          <>
            Hi, {user.name}
            <button className="btn" onClick={() => { logout(); navigate("/"); }}>Logout</button>
          </>
        )}
      </span>
    </div>
  );
}