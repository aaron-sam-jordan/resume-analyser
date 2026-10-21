import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="a-nav">
      <span>
        <b>Resume Analyser Admin</b>
        <Link to="/">Home</Link>
        <Link to="/admin">Dashboard</Link>
        <Link to="/admin/profile">Profile</Link>
      </span>
      <span className="right">
        {user.name}{" "}
        <button className="a-btn" onClick={() => { logout(); navigate("/"); }}>Logout</button>
      </span>
    </div>
  );
}