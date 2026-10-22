import { Doughnut } from "react-chartjs-2";
import "./setup";

export default function MatchDoughnut({ matched, missing }) {
  const data = {
    labels: ["Matched", "Missing"],
    datasets: [{ data: [matched, missing], backgroundColor: ["#BFE23A", "#E10600"], borderColor: "#FFF6E8", borderWidth: 4 }],
  };
  const options = { responsive: true, maintainAspectRatio: false, cutout: "58%", plugins: { legend: { position: "bottom" } } };
  return <div className="chart-box"><Doughnut data={data} options={options} /></div>;
}