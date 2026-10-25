import AdminNav from "../../components/AdminNav";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Radar, PolarArea } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, RadialLinearScale, ArcElement, PointElement, LineElement, Filler, Tooltip, Legend,
} from "chart.js";
import "../../components/charts/setup";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { downloadUserReport, userAnalyses } from "../../utils/userReport";
import "../../styles/theme-admin.css";

// PDF colors (r, g, b)
const INK = [16, 54, 42];
const LIME = [191, 226, 58];
const PEACH = [249, 234, 215];
const PAPER = [255, 246, 232];

// ---------- unique charts: polar area + radar ----------
ChartJS.register(CategoryScale, LinearScale, RadialLinearScale, ArcElement, PointElement, LineElement, Filler, Tooltip, Legend);

const C_INK = "#10362A";
const C_MUTED = "#5A6B60";
const C_GRID = "rgba(226, 205, 175, 0.8)";
const C_PINK = "#F28B82";
const font = { family: "DM Sans, system-ui, sans-serif", size: 11 };
const rScale = {
  beginAtZero: true,
  ticks: { precision: 0, color: C_MUTED, backdropColor: "transparent", font },
  grid: { color: C_GRID },
  angleLines: { color: C_GRID },
  pointLabels: { color: C_INK, font },
};

const polarConfig = (w) => ({
  type: "polarArea",
  data: {
    labels: w.days.map((d) => d.wd),
    datasets: [{
      data: w.days.map((d) => d.count),
      backgroundColor: ["rgba(242,139,130,0.75)", "rgba(246,194,139,0.75)", "rgba(191,226,58,0.75)", "rgba(127,181,154,0.75)",
        "rgba(221,240,143,0.9)", "rgba(242,139,130,0.5)", "rgba(16,54,42,0.55)"],
      borderColor: "#FFF6E8", borderWidth: 2,
    }],
  },
  options: {
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom", labels: { color: C_INK, font, usePointStyle: true, pointStyle: "circle", padding: 10 } } },
    scales: { r: { ...rScale, pointLabels: { display: false } } },
  },
});

const radarSkills = (w) => w.topSkills.slice(0, 6);
const radarOk = (w) => radarSkills(w).length >= 3;
const radarConfig = (w) => ({
  type: "radar",
  data: {
    labels: radarSkills(w).map((s) => s[0]),
    datasets: [{
      data: radarSkills(w).map((s) => s[1]),
      backgroundColor: "rgba(242,139,130,0.3)", borderColor: C_PINK, borderWidth: 3,
      pointBackgroundColor: "#fff", pointBorderColor: C_PINK, pointBorderWidth: 2, pointRadius: 4,
    }],
  },
  options: { maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { r: rScale } },
});

// draws a chart off-screen and returns it as a PNG data URL (used for the PDF)
const whiteBg = { id: "whiteBg", beforeDraw: (c) => { c.ctx.save(); c.ctx.fillStyle = "#ffffff"; c.ctx.fillRect(0, 0, c.width, c.height); c.ctx.restore(); } };
function chartImage(cfg) {
  const canvas = document.createElement("canvas");
  canvas.width = 560;
  canvas.height = 430;
  const chart = new ChartJS(canvas, { ...cfg, options: { ...cfg.options, responsive: false, animation: false }, plugins: [whiteBg] });
  const url = canvas.toDataURL("image/png");
  chart.destroy();
  return url;
}

const ymd = (d) => new Date(d).toLocaleDateString("en-CA");
const shortDate = (d) => d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
const fmt = (d) => (d ? new Date(d).toLocaleDateString() : "-");
const avg = (arr) => (arr.length ? Math.round((arr.reduce((s, v) => s + Number(v || 0), 0) / arr.length) * 10) / 10 : 0);

// Monday of the week that contains date d
function weekStart(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}

function topCounts(list, n) {
  const map = {};
  list.forEach((k) => { if (k) map[k] = (map[k] || 0) + 1; });
  return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, n);
}

function buildWeek(key, items, prevItems) {
  const start = new Date(key + "T00:00:00");
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const k = ymd(d);
    const list = items.filter((a) => ymd(a.created_at) === k);
    return {
      label: d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }),
      wd: d.toLocaleDateString(undefined, { weekday: "short" }),
      count: list.length,
      avg: list.length ? avg(list.map((a) => a.score)) : null,
    };
  });
  return {
    key,
    label: `${shortDate(start)} to ${shortDate(end)}`,
    items: [...items].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
    total: items.length,
    users: new Set(items.map((a) => a.user_name)).size,
    avg: avg(items.map((a) => a.score)),
    strong: items.filter((a) => a.score >= 70).length,
    prevTotal: prevItems.length,
    days,
    topUsers: topCounts(items.map((a) => a.user_name), 5),
    topSkills: topCounts(items.flatMap((a) => a.missing_skills || []), 8),
  };
}

const deltaText = (w) => {
  const d = w.total - w.prevTotal;
  return `${d >= 0 ? "+" : ""}${d} vs previous week`;
};

function downloadPdf(w) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // header band
  doc.setFillColor(...INK);
  doc.rect(0, 0, W, 72, "F");
  doc.setFillColor(...LIME);
  doc.rect(0, 72, W, 4, "F");
  doc.setTextColor(...PEACH);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("RESUME ANALYSER", 40, 34);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Weekly Report  |  ${w.label}`, 40, 55);

  doc.setTextColor(...INK);
  doc.setFontSize(9);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 40, 98);

  // summary boxes
  const boxes = [
    ["Analyses", String(w.total), deltaText(w)],
    ["Active users", String(w.users), ""],
    ["Average score", `${w.avg}%`, ""],
    ["Strong matches", String(w.strong), "score 70% or more"],
  ];
  const gap = 10;
  const bw = (W - 80 - gap * 3) / 4;
  boxes.forEach(([label, value, note], i) => {
    const x = 40 + i * (bw + gap);
    doc.setFillColor(...PAPER);
    doc.setDrawColor(...INK);
    doc.setLineWidth(0.8);
    doc.roundedRect(x, 110, bw, 66, 8, 8, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(90, 107, 96);
    doc.text(label.toUpperCase(), x + 10, 126);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...INK);
    doc.text(value, x + 10, 152);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(90, 107, 96);
    if (note) doc.text(note, x + 10, 167);
  });

  let y = 200;

  // charts row
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...INK);
  doc.text("Weekly charts", 40, y);
  y += 10;
  const cw = (W - 80 - 12) / 2;
  const ch = (cw * 430) / 560;
  doc.addImage(chartImage(polarConfig(w)), "PNG", 40, y, cw, ch);
  if (radarOk(w)) {
    doc.addImage(chartImage(radarConfig(w)), "PNG", 52 + cw, y, cw, ch);
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(90, 107, 96);
    doc.text("Not enough missing-skill data for the radar chart", 52 + cw + cw / 2, y + ch / 2, { align: "center" });
  }
  doc.setDrawColor(226, 205, 175);
  doc.setLineWidth(0.8);
  doc.roundedRect(40, y, cw, ch, 8, 8, "S");
  doc.roundedRect(52 + cw, y, cw, ch, 8, 8, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text("Activity by weekday", 40, y + ch + 14);
  doc.text("Skill gap radar (most missing skills)", 52 + cw, y + ch + 14);
  y += ch + 40;

  const section = (title, head, rows) => {
    if (y > H - 120) { doc.addPage(); y = 50; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...INK);
    doc.text(title, 40, y);
    autoTable(doc, {
      startY: y + 8,
      head: [head],
      body: rows.length ? rows : [[{ content: "No data this week", colSpan: head.length, styles: { halign: "center" } }]],
      theme: "grid",
      headStyles: { fillColor: INK, textColor: PEACH, fontSize: 9 },
      styles: { fontSize: 9, textColor: INK, lineColor: [226, 205, 175] },
      alternateRowStyles: { fillColor: PAPER },
      margin: { left: 40, right: 40 },
    });
    y = doc.lastAutoTable.finalY + 26;
  };

  section("Daily breakdown", ["Day", "Analyses", "Average score"],
    w.days.map((d) => [d.label, String(d.count), d.avg === null ? "-" : `${d.avg}%`]));
  section("Top users this week", ["User", "Analyses"],
    w.topUsers.map(([name, n]) => [name, String(n)]));
  section("Most missing skills", ["Skill", "Times missing"],
    w.topSkills.map(([s, n]) => [s, String(n)]));
  section("All analyses", ["Date", "User", "Job", "Score", "Missing skills"],
    w.items.map((a) => [fmt(a.created_at), a.user_name, a.job_title || "-", `${a.score}%`, (a.missing_skills || []).join(", ") || "-"]));

  // page numbers
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(90, 107, 96);
    doc.text(`Page ${i} of ${pages}`, W - 40, H - 20, { align: "right" });
    doc.text("Resume Analyser - Admin report", 40, H - 20);
  }

  doc.save(`weekly-report-${w.key}.pdf`);
}

export default function Reports() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [sel, setSel] = useState("");
  const [error, setError] = useState("");

  function handleErr(err) {
    if (err.status === 401) { logout(); navigate("/"); return; }
    setError(err.message);
  }

  useEffect(() => {
    Promise.all([api.get("/admin/analyses"), api.get("/admin/users")])
      .then(([a, u]) => { setAnalyses(a.analyses); setUsers(u.users); setLoaded(true); })
      .catch(handleErr);
  }, []);

  const weeks = useMemo(() => {
    const map = {};
    analyses.forEach((a) => {
      if (!a.created_at) return;
      const k = ymd(weekStart(new Date(a.created_at)));
      (map[k] = map[k] || []).push(a);
    });
    return Object.keys(map).sort().reverse().map((k) => {
      const prev = new Date(k + "T00:00:00");
      prev.setDate(prev.getDate() - 7);
      return buildWeek(k, map[k], map[ymd(prev)] || []);
    });
  }, [analyses]);

  const current = weeks.find((w) => w.key === sel) || weeks[0];

  if (!loaded && !error) return <div className="admin-page">Loading...</div>;

  return (
    <div className="admin-page">
      <div className="in">
        <AdminNav />
        <h1>Reports</h1>
        {error && <div className="a-err" role="alert">{error}</div>}

        {!current && loaded && <div className="a-panel">No analyses yet, so there is nothing to report.</div>}

        {current && (
          <>
            <div className="a-controls">
              <select className="a-input" value={current.key} onChange={(e) => setSel(e.target.value)} aria-label="Select week">
                {weeks.map((w) => <option key={w.key} value={w.key}>Week: {w.label}</option>)}
              </select>
              <button className="a-btn solid" onClick={() => downloadPdf(current)}>Download PDF</button>
            </div>

            <div className="a-kpis">
              <div className="a-kpi"><b>{current.total}</b>Analyses ({deltaText(current)})</div>
              <div className="a-kpi"><b>{current.users}</b>Active users</div>
              <div className="a-kpi"><b>{current.avg}%</b>Average score</div>
              <div className="a-kpi"><b>{current.strong}</b>Strong matches (70%+)</div>
            </div>

            <div className="a-grid two">
              <div className="a-panel"><h3>Activity by weekday</h3><div className="a-chart mid">
                <PolarArea data={polarConfig(current).data} options={polarConfig(current).options} /></div></div>
              <div className="a-panel"><h3>Skill gap radar</h3><div className="a-chart mid">
                {radarOk(current)
                  ? <Radar data={radarConfig(current).data} options={radarConfig(current).options} />
                  : <p>Not enough missing-skill data this week to draw the radar (needs 3 or more skills).</p>}
              </div></div>
            </div>

            <div className="a-grid">
              <div className="a-panel"><h3>Daily breakdown</h3><div className="a-scroll"><table>
                <thead><tr><th>Day</th><th>Analyses</th><th>Avg score</th></tr></thead>
                <tbody>{current.days.map((d) => (
                  <tr key={d.label}><td>{d.label}</td><td>{d.count}</td><td>{d.avg === null ? "-" : `${d.avg}%`}</td></tr>
                ))}</tbody>
              </table></div></div>

              <div className="a-panel"><h3>Top users</h3><div className="a-scroll"><table>
                <thead><tr><th>User</th><th>Analyses</th></tr></thead>
                <tbody>{current.topUsers.length ? current.topUsers.map(([n, c]) => (
                  <tr key={n}><td>{n}</td><td>{c}</td></tr>
                )) : <tr><td colSpan="2">No data</td></tr>}</tbody>
              </table></div>
              <h3 style={{ marginTop: 14 }}>Most missing skills</h3>
              <div>{current.topSkills.length ? current.topSkills.map(([s, c]) => (
                <span key={s} className="a-chip no">{s} ({c})</span>
              )) : "No data"}</div></div>
            </div>

            <div className="a-panel">
              <h3>Analyses this week</h3>
              <div className="a-scroll"><table>
                <thead><tr><th>Date</th><th>User</th><th>Job</th><th>Score</th><th>Missing skills</th></tr></thead>
                <tbody>{current.items.map((a) => (
                  <tr key={a.id}><td>{fmt(a.created_at)}</td><td>{a.user_name}</td><td>{a.job_title || "-"}</td>
                    <td>{a.score}%</td><td>{(a.missing_skills || []).join(", ")}</td></tr>
                ))}</tbody>
              </table></div>
            </div>

            <div className="a-panel">
              <h3>All weekly reports</h3>
              <div className="a-scroll"><table>
                <thead><tr><th>Week</th><th>Analyses</th><th>Active users</th><th>Avg score</th><th>Actions</th></tr></thead>
                <tbody>{weeks.map((w) => (
                  <tr key={w.key}>
                    <td>{w.label}</td><td>{w.total}</td><td>{w.users}</td><td>{w.avg}%</td>
                    <td>
                      <button className="a-btn" onClick={() => { setSel(w.key); window.scrollTo({ top: 0, behavior: "smooth" }); }}>View</button>
                      <button className="a-btn solid" onClick={() => downloadPdf(w)}>PDF</button>
                    </td>
                  </tr>
                ))}</tbody>
              </table></div>
            </div>

            <div className="a-panel">
              <h3>User reports</h3>
              <div className="a-scroll"><table>
                <thead><tr><th>User</th><th>Email</th><th>Analyses</th><th>Avg score</th><th>Report</th></tr></thead>
                <tbody>{users.filter((u) => u.role !== "admin").map((u) => {
                  const list = userAnalyses(u, analyses);
                  return (
                    <tr key={u.id}>
                      <td>{u.name}</td><td>{u.email}</td><td>{u.analyses_count}</td>
                      <td>{list.length ? `${avg(list.map((a) => Number(a.score) || 0))}%` : "-"}</td>
                      <td><button className="a-btn solid" onClick={() => downloadUserReport(u, analyses)}>PDF</button></td>
                    </tr>
                  );
                })}</tbody>
              </table></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}