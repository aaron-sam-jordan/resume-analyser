import {
  Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale,
  LineElement, PointElement, Filler, Tooltip, Legend,
} from "chart.js";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale,
  LineElement, PointElement, Filler, Tooltip, Legend);
ChartJS.defaults.font.family = "Poppins, system-ui, sans-serif";
ChartJS.defaults.font.weight = "600";
ChartJS.defaults.color = "#000";