import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import ThemeToggleButton from "../../components/ThemeToggleButton";
import "./DashboardStyles.css";
import "./DarkTheme.css";
import "./LightTheme.css";

function DashboardLayout({ sidebarLinks, title, subtitle, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mainContentRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  }, [location.pathname]);

  return (
    <div className="dashboard-container">
      <div
        className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <Sidebar links={sidebarLinks} closeSidebar={() => setSidebarOpen(false)} />
      </div>

      <main className="dashboard-main" ref={mainContentRef}>
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
            <ThemeToggleButton />
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
