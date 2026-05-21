import "./ProfileProgressBar.css";

function ProfileProgressBar({ completionPercentage = 0 }) {
  const getProgressColor = (percentage) => {
    if (percentage <= 33) return "#e74c3c"; // Red
    if (percentage <= 66) return "#f39c12"; // Orange
    if (percentage < 100) return "#f1c40f"; // Yellow
    return "#27ae60"; // Green
  };

  const getProgressLabel = (percentage) => {
    if (percentage === 0) return "Not Started";
    if (percentage <= 33) return "Incomplete";
    if (percentage <= 66) return "Partial";
    if (percentage < 100) return "Almost Complete";
    return "Complete ✓";
  };

  const sections = [
    { name: "Contact Info", completed: completionPercentage >= 10 },
    { name: "Basic Details", completed: completionPercentage >= 30 },
    { name: "Academic Info", completed: completionPercentage >= 60 },
    { name: "Skills", completed: completionPercentage >= 80 },
    { name: "Documents", completed: completionPercentage >= 100 }
  ];

  return (
    <div className="progress-container">
      <div className="progress-header">
        <h3>Profile Completion</h3>
        <div className="progress-stats">
          <span className="percentage">{completionPercentage}%</span>
          <span className="label">{getProgressLabel(completionPercentage)}</span>
        </div>
      </div>

      <div className="progress-bar-wrapper">
        <div
          className="progress-bar-fill"
          style={{
            width: `${completionPercentage}%`,
            backgroundColor: getProgressColor(completionPercentage)
          }}
        >
          <div className="progress-shimmer"></div>
        </div>
      </div>

      <div className="sections-grid">
        {sections.map((section) => (
          <div key={section.name} className="section-item">
            <div className={`status-icon ${section.completed ? "completed" : "pending"}`}>
              {section.completed ? "✓" : "○"}
            </div>
            <span className="section-name">{section.name}</span>
          </div>
        ))}
      </div>

      {completionPercentage < 100 && (
        <div className="recommendation-box">
          <p>
            📌 Complete your profile to unlock better job matches and increase your visibility to employers!
          </p>
        </div>
      )}

      {completionPercentage === 100 && (
        <div className="success-box">
          <p>
            ✨ Congratulations! Your profile is complete. You're ready to apply for jobs!
          </p>
        </div>
      )}
    </div>
  );
}

export default ProfileProgressBar;
