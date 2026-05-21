import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

function Sidebar({ links = [] }) {
  const navigate = useNavigate();
  const { role, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const defaultLinks = [
    { label: "Dashboard", action: () => navigate(`/${role}/dashboard`) },
    ...(role === "student"
      ? [
          { label: "Available Jobs", action: () => navigate(`/${role}/dashboard?section=jobs`) },
          { label: "My Applications", action: () => navigate(`/${role}/dashboard?section=applications`) },
          { label: "Mock Tests", action: () => navigate(`/${role}/dashboard?section=mock`) },
          { label: "Resume Builder", action: () => navigate(`/${role}/dashboard?section=resume`) },
          { label: "Interview Prep", action: () => navigate(`/${role}/dashboard?section=interview`) },
          { label: "Career Guidance", action: () => navigate(`/${role}/dashboard?section=career`) },
          { label: "Profile", action: () => navigate(`/${role}/dashboard?section=profile`) }
        ]
      : []),
    ...(role === "admin"
      ? [
          { label: "Manage Students", action: () => navigate(`/${role}/dashboard?section=students`) },
          { label: "Manage Companies", action: () => navigate(`/${role}/dashboard?section=companies`) },
          { label: "Placement Drives", action: () => navigate(`/${role}/dashboard?section=drives`) },
          { label: "Reports", action: () => navigate(`/${role}/dashboard?section=reports`) }
        ]
      : []),
    ...(role === "company"
      ? [
          { label: "Post New Job", action: () => navigate(`/${role}/dashboard?tab=post`) },
          { label: "Posted Jobs", action: () => navigate(`/${role}/dashboard?tab=jobs`) },
          { label: "Applications", action: () => navigate(`/${role}/dashboard?tab=applicants`) },
          { label: "Shortlisted Students", action: () => navigate(`/${role}/dashboard?tab=shortlisted`) },
          { label: "Analytics", action: () => navigate(`/${role}/dashboard?tab=analytics`) },
          { label: "Hiring Pipeline", action: () => navigate(`/${role}/dashboard?tab=hiring`) },
          { label: "Manage Students", action: () => navigate(`/${role}/dashboard?tab=students`) },
          { label: "Manage Companies", action: () => navigate(`/${role}/dashboard?tab=companies`) },
          { label: "Placement Drives", action: () => navigate(`/${role}/dashboard?tab=drives`) },
          { label: "Placement Reports", action: () => navigate(`/${role}/dashboard?tab=reports`) },
          { label: "Send Emails", action: () => navigate(`/${role}/dashboard?tab=email`) },
          { label: "Announcements", action: () => navigate(`/${role}/dashboard?tab=announcements`) },
          { label: "Advanced Analytics", action: () => navigate(`/${role}/dashboard?tab=advanced`) },
          { label: "Activity Logs", action: () => navigate(`/${role}/dashboard?tab=activity`) }
        ]
      : [])
  ];

  const menuLinks = links.length > 0 ? links : defaultLinks;

  return (
    <div className={`sidebar-panel ${isOpen ? "open" : ""}`}>
      <button
        className="sidebar-toggle-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
      >
        {isOpen ? "Close Menu" : "Open Menu"}
      </button>

      <h2>Placement Portal</h2>

      <ul className="sidebar-menu">
        {menuLinks.map((link) => (
          <li key={link.label}>
            <button
              type="button"
              className="sidebar-link"
              onClick={() => {
                if (link.action) link.action();
                setIsOpen(false);
              }}
            >
              {link.label}
            </button>
          </li>
        ))}
      </ul>

      <button onClick={handleLogout} className="sidebar-logout-btn">
        Logout
      </button>
    </div>
  );
}

export default Sidebar;