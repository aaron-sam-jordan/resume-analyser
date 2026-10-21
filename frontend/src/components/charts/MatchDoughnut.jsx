import { Doughnut } from "react-chartjs-2";
import "./setup";

export default function MatchDoughnut({ matched, missing }) {
  const data = {
    labels: ["Matched", "Missing"],
    datasets: [{
      data: [matched, missing],
      backgroundColor: ["#7be0a0", "#ff7a6b"],
      borderColor: "#000",
      borderWidth: 3,
    }],
  };
  const options = { responsive: true, maintainAspectRatio: false, cutout: "55%", plugins: { legend: { position: "bottom" } } };
  return <div className="chart-box"><Doughnut data={data} options={options} /></div>;
}