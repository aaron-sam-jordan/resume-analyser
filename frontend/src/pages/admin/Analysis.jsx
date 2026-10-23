import AdminNav from "../../components/AdminNav";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import "../../components/charts/setup";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import "../../styles/theme-admin.css";

// soft, cute palette (change colors here)
const INK = "#10362A";
const MUTED = "#5A6B60";
const GRID = "rgba(226, 205, 175, 0.55)";
const PINK = "#F28B82";
const PEACH = "#F6C28B";
const LIME = "#BFE23A";
const SAGE = "#7FB59A";
const PAPER = "#FFF6E8";
const MIX = [PINK, PEACH, LIME, SAGE, "#DDF08F"];

const font = { family: "DM Sans, system-ui, sans-serif", size: 11 };
const axis = (title) => ({
  beginAtZero: true,
  border: { display: false },
  ticks: { color: MUTED, precision: 0, font },
  grid: { color: GRID, borderDash: [4, 4] },
  title: { display: !!title, text: title, color: MUTED, font },
});
const opts = (xTitle, yTitle, extra = {}) => ({
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { x: axis(xTitle), y: axis(yTitle) },
  ...extra,
});
const donutOpts = {
  responsive: true, maintainAspectRatio: false, cutout: "65%",
  plugins: { legend: { position: "bottom", labels: { color: INK, font, usePointStyle: true, pointStyle: "circle", padding: 12 } } },
};
const donutSet = (data, colors) => ({
  data, backgroundColor: colors, borderColor: PAPER, borderWidth: 3, borderRadius: 8, spacing: 3, hoverOffset: 6,
});
const barSet = (data, color) => ({
  data, backgroundColor: color, borderRadius: 10, borderSkipped: false, maxBarThickness: 38,
});
const lineSet = (data, color, fillColor) => ({
  data, borderColor: color, backgroundColor: fillColor, fill: true, tension: 0.4, borderWidth: 3,
  pointRadius: 4, pointHoverRadius: 6, pointBackgroundColor: "#fff", pointBorderColor: color, pointBorderWidth: 2,
});

// count how many times each key appears, return top N as [key, count]
function topCounts(items, n) {
  const map = {};
  items.forEach((k) => { if (k) map[k] = (map[k] || 0) + 1; });
  return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, n);
}

export default function Analysis() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [error, setError] = useState("");

  function handleErr(err) {
    if (err.status === 401) { logout(); navigate("/"); return; }
    setError(err.message);
  }

  useEffect(() => {
    Promise.all([api.get("/admin/stats"), api.get("/admin/users"), api.get("/admin/analyses")])
      .then(([s, u, a]) => { setStats(s); setUsers(u.users); setAnalyses(a.analyses); })
      .catch(handleErr);
  }, []);

  const extra = useMemo(() => {
    const regular = users.filter((u) => u.role !== "admin");
    const blocked = regular.filter((u) => u.is_blocked).length;
    const topUsers = [...regular].sort((a, b) => b.analyses_count - a.analyses_count).slice(0, 5);

    const bands = { strong: 0, medium: 0, low: 0 };
    analyses.forEach((a) => {
      if (a.score >= 70) bands.strong++;
      else if (a.score >= 40) bands.medium++;
      else bands.low++;
    });

    const byDay = {};
    analyses.forEach((a) => {
      if (!a.created_at) return;
      const day = new Date(a.created_at).toLocaleDateString("en-CA");
      (byDay[day] = byDay[day] || []).push(a.score);
    });
    const days = Object.keys(byDay).sort();
    const avgPerDay = days.map((d) => +(byDay[d].reduce((s, v) => s + v, 0) / byDay[d].length).toFixed(1));

    const jobs = topCounts(analyses.map((a) => a.job_title), 5);
    return { active: regular.length - blocked, blocked, topUsers, bands, days, avgPerDay, jobs };
  }, [users, analyses]);

  if (!stats && !error) return <div className="admin-page">Loading...</div>;

  return (
    <div className="admin-page">
      <div className="in">
        <AdminNav />
        <h1>Analysis</h1>
        {error && <div className="a-err" role="alert">{error}</div>}

        {stats && (
          <div className="a-grid big">
            <div className="a-panel"><h3>📈 Analyses per day</h3><div className="a-chart tall">
              <Line data={{ labels: stats.analyses_per_day.map((d) => d.date.slice(5)),
                datasets: [lineSet(stats.analyses_per_day.map((d) => d.total), PINK, "rgba(242,139,130,0.22)")] }}
                options={opts("", "")} /></div></div>

            <div className="a-panel"><h3>🎯 Score distribution</h3><div className="a-chart tall">
              <Bar data={{ labels: Object.keys(stats.score_distribution),
                datasets: [barSet(Object.values(stats.score_distribution), LIME)] }}
                options={opts("", "")} /></div></div>

            <div className="a-panel"><h3>⭐ Average score per day</h3><div className="a-chart tall">
              <Line data={{ labels: extra.days.map((d) => d.slice(5)),
                datasets: [lineSet(extra.avgPerDay, SAGE, "rgba(127,181,154,0.22)")] }}
                options={opts("", "", { scales: { x: axis(""), y: { ...axis(""), max: 100 } } })} /></div></div>

            <div className="a-panel"><h3>👑 Top users</h3><div className="a-chart tall">
              <Bar data={{ labels: extra.topUsers.map((u) => u.name),
                datasets: [barSet(extra.topUsers.map((u) => u.analyses_count), PEACH)] }}
                options={opts("", "")} /></div></div>

            <div className="a-panel"><h3>💚 Match quality</h3><div className="a-chart tall">
              <Doughnut data={{ labels: ["Strong 70%+", "Medium 40-69%", "Low under 40%"],
                datasets: [donutSet([extra.bands.strong, extra.bands.medium, extra.bands.low], [LIME, PEACH, PINK])] }}
                options={donutOpts} /></div></div>

            <div className="a-panel"><h3>🌿 Active vs blocked</h3><div className="a-chart tall">
              <Doughnut data={{ labels: ["Active", "Blocked"],
                datasets: [donutSet([extra.active, extra.blocked], [LIME, PINK])] }}
                options={donutOpts} /></div></div>

            <div className="a-panel"><h3>💼 Popular job titles</h3><div className="a-chart tall">
              <Bar data={{ labels: extra.jobs.map((j) => j[0]),
                datasets: [barSet(extra.jobs.map((j) => j[1]), SAGE)] }}
                options={opts("", "", { indexAxis: "y" })} /></div></div>

            <div className="a-panel span2"><h3>🧩 Most missing skills</h3><div className="a-chart tall">
              <Bar data={{ labels: stats.most_missing_skills.map((s) => s.skill),
                datasets: [barSet(stats.most_missing_skills.map((s) => s.count), MIX)] }}
                options={opts("", "")} /></div></div>
          </div>
        )}
      </div>
    </div>
  );
}