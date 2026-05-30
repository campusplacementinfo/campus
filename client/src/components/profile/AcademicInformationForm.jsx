import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateAcademicInfo } from "../../services/api";
import "./AcademicInformationForm.css";

function AcademicInformationForm({ initialData, onSave, onBack }) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeSection, setActiveSection] = useState("current");

  const [formData, setFormData] = useState({
    currentDegree: initialData?.currentDegree || "",
    specialization: initialData?.specialization || "",
    institution: initialData?.institution || "",
    enrollmentYear: initialData?.enrollmentYear || "",
    expectedGraduationYear: initialData?.expectedGraduationYear || "",
    cgpa: initialData?.cgpa || "",

    board10: initialData?.board10 || "",
    percentage10: initialData?.percentage10 || "",
    yearPassed10: initialData?.yearPassed10 || "",

    board12: initialData?.board12 || "",
    percentage12: initialData?.percentage12 || "",
    yearPassed12: initialData?.yearPassed12 || "",

    activeBacklogs: initialData?.activeBacklogs || 0,
    totalBacklogs: initialData?.totalBacklogs || 0
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setError("");
      setSuccess("");
      setLoading(true);

      if (!formData.institution) {
        setError("Institution is required");
        return;
      }

      if (formData.cgpa && (formData.cgpa < 0 || formData.cgpa > 10)) {
        setError("CGPA must be between 0 and 10");
        return;
      }

      if (formData.percentage10 && (formData.percentage10 < 0 || formData.percentage10 > 100)) {
        setError("10th percentage must be between 0 and 100");
        return;
      }

      if (formData.percentage12 && (formData.percentage12 < 0 || formData.percentage12 > 100)) {
        setError("12th percentage must be between 0 and 100");
        return;
      }

      const response = await updateAcademicInfo(formData);
      setSuccess("✓ Academic information updated successfully!");
      setIsEditing(false);

      if (onSave) {
        setTimeout(() => onSave(), 500);
      }
    } catch (err) {
      setError("Failed to update academic information. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      currentDegree: initialData?.currentDegree || "",
      specialization: initialData?.specialization || "",
      institution: initialData?.institution || "",
      enrollmentYear: initialData?.enrollmentYear || "",
      expectedGraduationYear: initialData?.expectedGraduationYear || "",
      cgpa: initialData?.cgpa || "",
      board10: initialData?.board10 || "",
      percentage10: initialData?.percentage10 || "",
      yearPassed10: initialData?.yearPassed10 || "",
      board12: initialData?.board12 || "",
      percentage12: initialData?.percentage12 || "",
      yearPassed12: initialData?.yearPassed12 || "",
      activeBacklogs: initialData?.activeBacklogs || 0,
      totalBacklogs: initialData?.totalBacklogs || 0
    });
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  if (!isEditing) {
    return (
      <div className="academic-info-display">
        <div className="info-card">
          <h4>🎓 Degree</h4>
          <p>{formData.currentDegree || "Not provided"}</p>
        </div>
        <div className="info-card">
          <h4>🏫 Institution</h4>
          <p>{formData.institution || "Not provided"}</p>
        </div>
        <div className="info-card">
          <h4>📊 CGPA</h4>
          <p>{formData.cgpa || "Not provided"}</p>
        </div>
        <div className="info-card">
          <h4>📚 Specialization</h4>
          <p>{formData.specialization || "Not provided"}</p>
        </div>
        <div className="info-card">
          <h4>🔴 Active Backlogs</h4>
          <p>{formData.activeBacklogs || 0}</p>
        </div>
        <div className="info-card">
          <h4>⚫ Total Backlogs</h4>
          <p>{formData.totalBacklogs || 0}</p>
        </div>
        <button
          className="edit-button"
          onClick={() => setIsEditing(true)}
        >
          ✏️ Edit Academic Information
        </button>
        <button
          className="back-button"
          onClick={() => (onBack ? onBack() : navigate(-1))}
        >
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className="academic-info-form">
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Tabs */}
      <div className="tabs-container">
        <button
          className={`tab-button ${activeSection === "current" ? "active" : ""}`}
          onClick={() => setActiveSection("current")}
        >
          📚 Current Education
        </button>
        <button
          className={`tab-button ${activeSection === "10th" ? "active" : ""}`}
          onClick={() => setActiveSection("10th")}
        >
          10th Standard
        </button>
        <button
          className={`tab-button ${activeSection === "12th" ? "active" : ""}`}
          onClick={() => setActiveSection("12th")}
        >
          12th Standard
        </button>
        <button
          className={`tab-button ${activeSection === "other" ? "active" : ""}`}
          onClick={() => setActiveSection("other")}
        >
          ⚙️ Other
        </button>
      </div>

      {/* Current Education */}
      {activeSection === "current" && (
        <div className="tab-content">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="currentDegree">Degree *</label>
              <select
                id="currentDegree"
                name="currentDegree"
                value={formData.currentDegree}
                onChange={handleChange}
              >
                <option value="">Select Degree</option>
                <option value="B.Tech">B.Tech</option>
                <option value="M.Tech">M.Tech</option>
                <option value="BCA">BCA</option>
                <option value="MCA">MCA</option>
                <option value="B.Sc">B.Sc</option>
                <option value="M.Sc">M.Sc</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="specialization">Specialization</label>
              <input
                type="text"
                id="specialization"
                name="specialization"
                placeholder="e.g., Computer Science"
                value={formData.specialization}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="institution">Institution *</label>
              <input
                type="text"
                id="institution"
                name="institution"
                placeholder="University name"
                value={formData.institution}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="cgpa">CGPA</label>
              <input
                type="number"
                id="cgpa"
                name="cgpa"
                placeholder="0.0"
                min="0"
                max="10"
                step="0.01"
                value={formData.cgpa}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="enrollmentYear">Enrollment Year</label>
              <input
                type="number"
                id="enrollmentYear"
                name="enrollmentYear"
                placeholder="2020"
                value={formData.enrollmentYear}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="expectedGraduationYear">Expected Graduation Year</label>
              <input
                type="number"
                id="expectedGraduationYear"
                name="expectedGraduationYear"
                placeholder="2024"
                value={formData.expectedGraduationYear}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      )}

      {/* 10th Standard */}
      {activeSection === "10th" && (
        <div className="tab-content">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="board10">Board</label>
              <input
                type="text"
                id="board10"
                name="board10"
                placeholder="e.g., CBSE, ICSE"
                value={formData.board10}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="percentage10">Percentage</label>
              <input
                type="number"
                id="percentage10"
                name="percentage10"
                placeholder="0.0"
                min="0"
                max="100"
                step="0.01"
                value={formData.percentage10}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="yearPassed10">Year Passed</label>
              <input
                type="number"
                id="yearPassed10"
                name="yearPassed10"
                placeholder="2017"
                value={formData.yearPassed10}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      )}

      {/* 12th Standard */}
      {activeSection === "12th" && (
        <div className="tab-content">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="board12">Board</label>
              <input
                type="text"
                id="board12"
                name="board12"
                placeholder="e.g., CBSE, ICSE"
                value={formData.board12}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="percentage12">Percentage</label>
              <input
                type="number"
                id="percentage12"
                name="percentage12"
                placeholder="0.0"
                min="0"
                max="100"
                step="0.01"
                value={formData.percentage12}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="yearPassed12">Year Passed</label>
              <input
                type="number"
                id="yearPassed12"
                name="yearPassed12"
                placeholder="2019"
                value={formData.yearPassed12}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      )}

      {/* Other Information */}
      {activeSection === "other" && (
        <div className="tab-content">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="activeBacklogs">Active Backlogs</label>
              <input
                type="number"
                id="activeBacklogs"
                name="activeBacklogs"
                placeholder="0"
                min="0"
                value={formData.activeBacklogs}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="totalBacklogs">Total Backlogs</label>
              <input
                type="number"
                id="totalBacklogs"
                name="totalBacklogs"
                placeholder="0"
                min="0"
                value={formData.totalBacklogs}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      )}

      <div className="form-actions">
        <button
          className="save-button"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Saving..." : "✓ Save Changes"}
        </button>
        <button
          className="cancel-button"
          onClick={handleCancel}
          disabled={loading}
        >
          ✕ Cancel
        </button>
      </div>
    </div>
  );
}

export default AcademicInformationForm;
