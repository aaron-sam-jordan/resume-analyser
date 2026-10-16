import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div style={{ padding: 24 }}>
      <h1>Admin dashboard (coming later)</h1>
      <p>Logged in as {user.name} ({user.role})</p>
      <button className="btn" onClick={() => { logout(); navigate("/login"); }}>Logout</button>
    </div>
  );
}