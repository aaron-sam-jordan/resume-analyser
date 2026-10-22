import { Link } from "react-router-dom";
import Avatar from "./Avatar";

export default function AdminNav() {
  return (
    <div className="a-nav">
      <span>
        <b>Resume Analyser Admin</b>
        <Link to="/">Home</Link>
        <Link to="/admin">Dashboard</Link>
        <Link to="/admin/profile">Profile</Link>
      </span>
      <Avatar variant="admin" />
    </div>
  );
}