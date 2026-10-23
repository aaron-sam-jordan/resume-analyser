import { Link } from "react-router-dom";
import Avatar from "./Avatar";

export default function AdminNav() {
  return (
    <div className="a-nav">
      <span>
        <b>Admin</b>
        <Link to="/admin">Dashboard</Link>
        <Link to="/admin/analysis">Analysis</Link>
        <Link to="/admin/profile">Profile</Link>
        <Link to="/admin/reports">Reports</Link>
      </span>
      <Avatar variant="admin" />
    </div>
  );
}