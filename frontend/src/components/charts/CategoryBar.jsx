import { Bar } from "react-chartjs-2";
import "./setup";

export default function CategoryBar({ categories }) {
  const labels = Object.keys(categories);
  const data = {
    labels,
    datasets: [
      { label: "Resume", data: labels.map((k) => categories[k].resume), backgroundColor: "#BFE23A", borderColor: "#9DBF1E", borderWidth: 1, borderRadius: 6 },
      { label: "Job needs", data: labels.map((k) => categories[k].job), backgroundColor: "#E10600", borderRadius: 6 },
    ],
  };
  const options = {
    responsive: true, maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 }, title: { display: true, text: "Number of skills" } },
      x: { title: { display: true, text: "Category" } },
    },
  };
  return <div className="chart-box"><Bar data={data} options={options} /></div>;
}