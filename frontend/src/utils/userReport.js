import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Chart as ChartJS, registerables } from "chart.js";

ChartJS.register(...registerables);

const INK = [16, 54, 42];
const LIME = [191, 226, 58];
const PEACH = [249, 234, 215];
const PAPER = [255, 246, 232];
const MUTED = [90, 107, 96];
const font = { family: "DM Sans, system-ui, sans-serif", size: 11 };
const GRID = "rgba(226, 205, 175, 0.7)";

const fmt = (d) => (d ? new Date(d).toLocaleDateString() : "-");
const shortDay = (d) => new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short" });
const avg = (arr) => (arr.length ? Math.round((arr.reduce((s, v) => s + v, 0) / arr.length) * 10) / 10 : 0);

function topCounts(list, n) {
  const map = {};
  list.forEach((k) => { if (k) map[k] = (map[k] || 0) + 1; });
  return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, n);
}

// all analyses that belong to one user (uses user_id when the API sends it, otherwise the name)
export function userAnalyses(user, analyses) {
  return analyses.filter((a) => (a.user_id !== undefined && a.user_id !== null ? a.user_id === user.id : a.user_name === user.name));
}

const lineCfg = (list) => ({
  type: "line",
  data: {
    labels: list.map((a) => shortDay(a.created_at)),
    datasets: [{
      data: list.map((a) => Number(a.score) || 0),
      borderColor: "#F28B82", backgroundColor: "rgba(242,139,130,0.22)", fill: true, tension: 0.4, borderWidth: 3,
      pointRadius: 4, pointBackgroundColor: "#fff", pointBorderColor: "#F28B82", pointBorderWidth: 2,
    }],
  },
  options: {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: "#5A6B60", font }, grid: { display: false } },
      y: { min: 0, max: 100, ticks: { color: "#5A6B60", font }, grid: { color: GRID, borderDash: [4, 4] } },
    },
  },
});

const barCfg = (skills) => ({
  type: "bar",
  data: {
    labels: skills.map((s) => s[0]),
    datasets: [{
      data: skills.map((s) => s[1]),
      backgroundColor: ["#F28B82", "#F6C28B", "#BFE23A", "#7FB59A", "#DDF08F", "#10362A"],
      borderRadius: 8, borderSkipped: false, maxBarThickness: 28,
    }],
  },
  options: {
    indexAxis: "y",
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { beginAtZero: true, ticks: { precision: 0, color: "#5A6B60", font }, grid: { color: GRID, borderDash: [4, 4] } },
      y: { ticks: { color: "#10362A", font }, grid: { display: false } },
    },
  },
});

// draws a chart off-screen and returns a PNG data URL
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

export function downloadUserReport(user, allAnalyses) {
  const list = userAnalyses(user, allAnalyses).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  const scores = list.map((a) => Number(a.score) || 0);
  const total = list.length;
  const average = avg(scores);
  const best = total ? Math.max(...scores) : 0;
  const latest = total ? scores[total - 1] : 0;
  const change = total > 1 ? Math.round((latest - scores[0]) * 10) / 10 : null;
  const skills = topCounts(list.flatMap((a) => a.missing_skills || []), 6);

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
  doc.text(`User Report  |  ${user.name}`, 40, 55);

  doc.setTextColor(...INK);
  doc.setFontSize(9);
  doc.text(`${user.email}   |   ${user.is_blocked ? "Blocked" : "Active"}   |   Generated on ${new Date().toLocaleDateString()}`, 40, 98);

  // summary boxes
  const boxes = [
    ["Analyses", String(total), ""],
    ["Average score", total ? `${average}%` : "-", ""],
    ["Best score", total ? `${best}%` : "-", ""],
    ["Latest score", total ? `${latest}%` : "-", change === null ? "" : `${change >= 0 ? "+" : ""}${change} since first`],
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
    doc.setTextColor(...MUTED);
    doc.text(label.toUpperCase(), x + 10, 126);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...INK);
    doc.text(value, x + 10, 152);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    if (note) doc.text(note, x + 10, 167);
  });

  let y = 200;

  if (!total) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...MUTED);
    doc.text("This user has not analysed any resumes yet.", 40, y + 10);
  } else {
    // charts row
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...INK);
    doc.text("Progress charts", 40, y);
    y += 10;
    const cw = (W - 80 - 12) / 2;
    const ch = (cw * 430) / 560;
    doc.addImage(chartImage(lineCfg(list)), "PNG", 40, y, cw, ch);
    if (skills.length) {
      doc.addImage(chartImage(barCfg(skills)), "PNG", 52 + cw, y, cw, ch);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...MUTED);
      doc.text("No missing skills recorded", 52 + cw + cw / 2, y + ch / 2, { align: "center" });
    }
    doc.setDrawColor(226, 205, 175);
    doc.setLineWidth(0.8);
    doc.roundedRect(40, y, cw, ch, 8, 8, "S");
    doc.roundedRect(52 + cw, y, cw, ch, 8, 8, "S");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    doc.text("Score over time", 40, y + ch + 14);
    doc.text("Most missing skills", 52 + cw, y + ch + 14);
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
        body: rows,
        theme: "grid",
        headStyles: { fillColor: INK, textColor: PEACH, fontSize: 9 },
        styles: { fontSize: 9, textColor: INK, lineColor: [226, 205, 175] },
        alternateRowStyles: { fillColor: PAPER },
        margin: { left: 40, right: 40 },
      });
      y = doc.lastAutoTable.finalY + 26;
    };

    section("All analyses", ["Date", "Job", "Score", "Missing skills"],
      list.map((a) => [fmt(a.created_at), a.job_title || "-", `${a.score}%`, (a.missing_skills || []).join(", ") || "-"]));
    if (skills.length) {
      section("Most missing skills", ["Skill", "Times missing"], skills.map(([s, n]) => [s, String(n)]));
    }
  }

  // page numbers
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(`Page ${i} of ${pages}`, W - 40, H - 20, { align: "right" });
    doc.text("Resume Analyser - Admin report", 40, H - 20);
  }

  const slug = user.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "user";
  doc.save(`user-report-${slug}.pdf`);
}