import { Line } from "react-chartjs-2";
import "./setup";

export default function ScoreLine({ scores }) {
  const data = {
    labels: scores.map((_, i) => `Attempt ${i + 1}`),
    datasets: [{
      label: "Match score (%)", data: scores, borderColor: "#E10600", backgroundColor: "rgba(225, 6, 0, 0.12)",
      fill: true, tension: 0.3, borderWidth: 3, pointRadius: 6,
      pointBackgroundColor: "#BFE23A", pointBorderColor: "#10362A", pointBorderWidth: 2,
    }],
  };
  const options = {
    responsive: true, maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, max: 100, title: { display: true, text: "Match score (%)" } },
      x: { title: { display: true, text: "Upload attempt" } },
    },
  };
  return <div className="chart-box"><Line data={data} options={options} /></div>;
}