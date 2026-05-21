import { useNavigate } from "react-router-dom";
import "./DashboardButton.css";

function DashboardButton() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const getDashboardConfig = (userRole) => {
    const config = {
      student: {
        path: "/student-dashboard",
        label: "Student Dashboard",
        icon: "🎓",
        color: "#3498db"
      },
      admin: {
        path: "/admin-dashboard",
        label: "Admin Dashboard",
        icon: "👨‍💼",
        color: "#e74c3c"
      },
      company: {
        path: "/company-dashboard",
        label: "Company Dashboard",
        icon: "🏢",
        color: "#27ae60"
      }
    };

    return config[userRole] || config.student;
  };

  const config = getDashboardConfig(role);

  const handleClick = () => {
    navigate(config.path, { replace: false });
  };

  return (
    <button
      className={`dashboard-button dashboard-button-${role}`}
      onClick={handleClick}
      style={{ "--button-color": config.color }}
    >
      <span className="button-icon">{config.icon}</span>
      <span className="button-text">{config.label}</span>
      <span className="button-arrow">→</span>
    </button>
  );
}

export default DashboardButton;
