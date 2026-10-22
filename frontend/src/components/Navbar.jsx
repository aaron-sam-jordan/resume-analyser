import { Link } from "react-router-dom";
import Avatar from "./Avatar";

export default function Navbar() {
  return (
    <div className="nav">
      <Link to="/" className="nav-brand">Resume Analyser</Link>
      <span className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/upload">Analyse</Link>
        <Link to="/profile">Profile</Link>
        <Avatar />
      </span>
    </div>
  );
}