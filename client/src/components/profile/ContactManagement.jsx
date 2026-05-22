import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateContactInfo } from "../../services/api";
import "./ContactManagement.css";

function ContactManagement({ initialData, onSave, onBack }) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    mobileNumber: initialData?.mobileNumber || "",
    alternateEmail: initialData?.alternateEmail || ""
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

      // Validation
      if (formData.mobileNumber && !/^[0-9]{10}$/.test(formData.mobileNumber)) {
        setError("Mobile number must be 10 digits");
        return;
      }

      if (formData.alternateEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.alternateEmail)) {
        setError("Invalid email format");
        return;
      }

      const response = await updateContactInfo(formData);
      setSuccess("✓ Contact information updated successfully!");
      setIsEditing(false);

      if (onSave) {
        setTimeout(() => onSave(), 500);
      }
    } catch (err) {
      setError("Failed to update contact information. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      mobileNumber: initialData?.mobileNumber || "",
      alternateEmail: initialData?.alternateEmail || ""
    });
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  if (!isEditing) {
    return (
      <div className="contact-info-display">
        <div className="info-card">
          <h4>📞 Mobile Number</h4>
          <p>{formData.mobileNumber || "Not provided"}</p>
        </div>
        <div className="info-card">
          <h4>📧 Alternate Email</h4>
          <p>{formData.alternateEmail || "Not provided"}</p>
        </div>
        <button
          className="edit-button"
          onClick={() => setIsEditing(true)}
        >
          ✏️ Edit Contact Information
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
    <div className="contact-info-form">
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="form-group">
        <label htmlFor="mobileNumber">Mobile Number (10 digits)</label>
        <div className="input-wrapper">
          <span className="input-icon">📱</span>
          <input
            type="tel"
            id="mobileNumber"
            name="mobileNumber"
            placeholder="9876543210"
            value={formData.mobileNumber}
            onChange={handleChange}
            maxLength="10"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="alternateEmail">Alternate Email</label>
        <div className="input-wrapper">
          <span className="input-icon">📧</span>
          <input
            type="email"
            id="alternateEmail"
            name="alternateEmail"
            placeholder="your.email@example.com"
            value={formData.alternateEmail}
            onChange={handleChange}
          />
        </div>
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

export default ContactManagement;
