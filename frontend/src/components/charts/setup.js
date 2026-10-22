import {
  Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale,
  LineElement, PointElement, Filler, Tooltip, Legend,
} from "chart.js";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale,
  LineElement, PointElement, Filler, Tooltip, Legend);
ChartJS.defaults.font.family = "DM Sans, system-ui, sans-serif";
ChartJS.defaults.font.weight = "500";
ChartJS.defaults.color = "#10362A";
ChartJS.defaults.borderColor = "#E2CDAF";