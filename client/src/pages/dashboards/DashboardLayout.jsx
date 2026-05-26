import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import "./DashboardStyles.css";

function DashboardLayout({ sidebarLinks, title, subtitle, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-container">
      <div
        className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <Sidebar links={sidebarLinks} />
      </div>

      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <button
            type="button"
            className={`menu-btn ${sidebarOpen ? "active" : ""}`}
            onClick={() => setSidebarOpen((prev) => !prev)}
          >
            <span />
          </button>
          <h3>Placement Portal</h3>
          <div className="topbar-actions">
          </div>
        </div>

        <div className="dashboard-header">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>

        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;
