import { Line } from "react-chartjs-2";
import "./setup";

export default function ScoreLine({ scores }) {
  const data = {
    labels: scores.map((_, i) => `Attempt ${i + 1}`),
    datasets: [{
      label: "Match score (%)", data: scores, borderColor: "#000", backgroundColor: "#7be0a0",
      fill: true, tension: 0.3, borderWidth: 3, pointRadius: 6,
      pointBackgroundColor: "#ffe14d", pointBorderColor: "#000", pointBorderWidth: 2.5,
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