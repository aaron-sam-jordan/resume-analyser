import { useEffect, useState } from "react";
import { api } from "./api/client";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user, loading } = useAuth();
  const [server, setServer] = useState("checking...");

  useEffect(() => {
    api.get("/health")
      .then(() => setServer("connected"))
      .catch((e) => setServer(e.message));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Resume Analyser</h1>
      <div className="card" style={{ maxWidth: 420 }}>
        <p>Server: <strong>{server}</strong></p>
        <p>{user ? `Logged in as ${user.name} (${user.role})` : "Not logged in"}</p>
        <button className="btn">Sticker button</button>
      </div>
    </div>
  );
}