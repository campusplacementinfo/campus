import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateBasicInfo } from "../../services/api";
import "./BasicInformationForm.css";

function BasicInformationForm({ initialData, onSave, onBack }) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || "",
    dateOfBirth: initialData?.dateOfBirth 
      ? new Date(initialData.dateOfBirth).toISOString().split('T')[0]
      : "",
    gender: initialData?.gender || "",
    bio: initialData?.bio || "",
    currentCity: initialData?.currentCity || "",
    permanentCity: initialData?.permanentCity || ""
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

      if (!formData.fullName) {
        setError("Full name is required");
        return;
      }

      if (formData.bio && formData.bio.length > 500) {
        setError("Bio must be less than 500 characters");
        return;
      }

      const response = await updateBasicInfo(formData);
      setSuccess("✓ Basic information updated successfully!");
      setIsEditing(false);

      if (onSave) {
        setTimeout(() => onSave(), 500);
      }
    } catch (err) {
      setError("Failed to update basic information. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: initialData?.fullName || "",
      dateOfBirth: initialData?.dateOfBirth 
        ? new Date(initialData.dateOfBirth).toISOString().split('T')[0]
        : "",
      gender: initialData?.gender || "",
      bio: initialData?.bio || "",
      currentCity: initialData?.currentCity || "",
      permanentCity: initialData?.permanentCity || ""
    });
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  if (!isEditing) {
    return (
      <div className="basic-info-display">
        <div className="info-card">
          <h4>👤 Full Name</h4>
          <p>{formData.fullName || "Not provided"}</p>
        </div>
        <div className="info-card">
          <h4>📅 Date of Birth</h4>
          <p>{formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString() : "Not provided"}</p>
        </div>
        <div className="info-card">
          <h4>⚧ Gender</h4>
          <p>{formData.gender || "Not provided"}</p>
        </div>
        <div className="info-card">
          <h4>📍 Current City</h4>
          <p>{formData.currentCity || "Not provided"}</p>
        </div>
        <div className="info-card">
          <h4>🏠 Permanent City</h4>
          <p>{formData.permanentCity || "Not provided"}</p>
        </div>
        <div className="info-card full-width">
          <h4>📝 Bio</h4>
          <p>{formData.bio || "Not provided"}</p>
        </div>
        <button
          className="edit-button"
          onClick={() => setIsEditing(true)}
        >
          ✏️ Edit Basic Information
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
    <div className="basic-info-form">
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="fullName">Full Name *</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            placeholder="John Doe"
            value={formData.fullName}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="dateOfBirth">Date of Birth</label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="currentCity">Current City</label>
          <input
            type="text"
            id="currentCity"
            name="currentCity"
            placeholder="City name"
            value={formData.currentCity}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="permanentCity">Permanent City</label>
          <input
            type="text"
            id="permanentCity"
            name="permanentCity"
            placeholder="City name"
            value={formData.permanentCity}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-group full-width">
        <label htmlFor="bio">Bio ({formData.bio.length}/500)</label>
        <textarea
          id="bio"
          name="bio"
          placeholder="Tell us about yourself..."
          value={formData.bio}
          onChange={handleChange}
          maxLength="500"
          rows="4"
        />
      </div>

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

export default BasicInformationForm;
