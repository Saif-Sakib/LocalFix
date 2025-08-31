import React, { useState } from "react";
import axios from "axios";
import "../../styles/CitizenIssue.css";

function CitizenIssue() {
  const [formData, setFormData] = useState({
    citizenName: "",
    citizenEmail: "",
    citizenPhone: "",
    citizenAddress: "",
    title: "",
    description: "",
    category: "",
    priority: "medium",
    location: "",
    imageUrl: ""
  });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
    "Infrastructure",
    "Public Safety",
    "Environment",
    "Transportation",
    "Utilities",
    "Public Health",
    "Education",
    "Housing",
    "Parks & Recreation",
    "Other"
  ];

  const priorities = [
    { value: "low", label: "Low", color: "#28a745" },
    { value: "medium", label: "Medium", color: "#ffc107" },
    { value: "high", label: "High", color: "#fd7e14" },
    { value: "urgent", label: "Urgent", color: "#dc3545" }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.citizenName.trim()) newErrors.citizenName = "Name is required";
    if (!formData.citizenEmail.trim()) newErrors.citizenEmail = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.citizenEmail)) newErrors.citizenEmail = "Invalid email format";
    if (!formData.title.trim()) newErrors.title = "Issue title is required";
    if (!formData.description.trim()) newErrors.description = "Issue description is required";
    if (!formData.category) newErrors.category = "Please select a category";
    if (!formData.location.trim()) newErrors.location = "Location is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const res = await axios.post("http://localhost:3000/api/issues", formData);
      setMessage(res.data.message);
      setFormData({
        citizenName: "",
        citizenEmail: "",
        citizenPhone: "",
        citizenAddress: "",
        title: "",
        description: "",
        category: "",
        priority: "medium",
        location: "",
        imageUrl: ""
      });
      setErrors({});
    } catch (err) {
      setMessage(err.response?.data?.message || "Error submitting issue. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="issue-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Report Community Issues</h1>
          <p>Help make your community better by reporting issues that need attention</p>
          <div className="stats">
            <div className="stat">
              <span className="stat-number">2,847</span>
              <span className="stat-label">Issues Resolved</span>
            </div>
            <div className="stat">
              <span className="stat-number">96%</span>
              <span className="stat-label">Response Rate</span>
            </div>
            <div className="stat">
              <span className="stat-number">3.2</span>
              <span className="stat-label">Avg Days to Resolve</span>
            </div>
          </div>
        </div>
      </div>

      <div className="issue-container">
        <div className="form-header">
          <h2>Submit Your Issue</h2>
          <p>Please provide detailed information to help us address your concern quickly and effectively.</p>
        </div>

        {message && (
          <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
            <div className="alert-icon">
              {message.includes('Error') ? '⚠️' : '✅'}
            </div>
            <span>{message}</span>
          </div>
        )}

        <form className="issue-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="citizenName">Full Name *</label>
                <input
                  id="citizenName"
                  type="text"
                  name="citizenName"
                  placeholder="Enter your full name"
                  value={formData.citizenName}
                  onChange={handleInputChange}
                  className={errors.citizenName ? 'error' : ''}
                  required
                />
                {errors.citizenName && <span className="error-text">{errors.citizenName}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="citizenEmail">Email Address *</label>
                <input
                  id="citizenEmail"
                  type="email"
                  name="citizenEmail"
                  placeholder="your.email@example.com"
                  value={formData.citizenEmail}
                  onChange={handleInputChange}
                  className={errors.citizenEmail ? 'error' : ''}
                  required
                />
                {errors.citizenEmail && <span className="error-text">{errors.citizenEmail}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="citizenPhone">Phone Number</label>
                <input
                  id="citizenPhone"
                  type="tel"
                  name="citizenPhone"
                  placeholder="+880 1XXX-XXXXXX"
                  value={formData.citizenPhone}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="citizenAddress">Your Address</label>
                <input
                  id="citizenAddress"
                  type="text"
                  name="citizenAddress"
                  placeholder="Your residential address"
                  value={formData.citizenAddress}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Issue Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Issue Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={errors.category ? 'error' : ''}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <span className="error-text">{errors.category}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="priority">Priority Level</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  {priorities.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="title">Issue Title *</label>
              <input
                id="title"
                type="text"
                name="title"
                placeholder="Brief, descriptive title for your issue"
                value={formData.title}
                onChange={handleInputChange}
                className={errors.title ? 'error' : ''}
                required
              />
              {errors.title && <span className="error-text">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="location">Location of Issue *</label>
              <input
                id="location"
                type="text"
                name="location"
                placeholder="Street address, landmark, or area where issue is located"
                value={formData.location}
                onChange={handleInputChange}
                className={errors.location ? 'error' : ''}
                required
              />
              {errors.location && <span className="error-text">{errors.location}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description">Detailed Description *</label>
              <textarea
                id="description"
                name="description"
                placeholder="Provide a detailed description of the issue. Include when you first noticed it, how it affects the community, and any other relevant information."
                value={formData.description}
                onChange={handleInputChange}
                className={errors.description ? 'error' : ''}
                required
                rows="6"
              ></textarea>
              {errors.description && <span className="error-text">{errors.description}</span>}
              <small className="form-hint">Be as specific as possible to help us understand and resolve the issue</small>
            </div>

            <div className="form-group">
              <label htmlFor="imageUrl">Image URL (Optional)</label>
              <input
                id="imageUrl"
                type="url"
                name="imageUrl"
                placeholder="https://example.com/image.jpg"
                value={formData.imageUrl}
                onChange={handleInputChange}
              />
              <small className="form-hint">Provide a link to an image that shows the issue (if available)</small>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Submitting...
              </>
            ) : (
              'Submit Issue Report'
            )}
          </button>
        </form>

        <div className="info-section">
          <h3>What Happens Next?</h3>
          <div className="process-steps">
            <div className="step">
              <div className="step-icon">📝</div>
              <div className="step-content">
                <h4>Review</h4>
                <p>Your issue will be reviewed by our team within 24 hours</p>
              </div>
            </div>
            <div className="step">
              <div className="step-icon">🔍</div>
              <div className="step-content">
                <h4>Investigation</h4>
                <p>We'll investigate and determine the appropriate department to handle your issue</p>
              </div>
            </div>
            <div className="step">
              <div className="step-icon">🛠️</div>
              <div className="step-content">
                <h4>Resolution</h4>
                <p>The relevant department will work to resolve your issue and update you on progress</p>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-info">
          <h3>Need Immediate Assistance?</h3>
          <div className="emergency-contacts">
            <div className="contact">
              <strong>Emergency Services:</strong> 999
            </div>
            <div className="contact">
              <strong>City Hall:</strong> +8801540-194651
            </div>
            <div className="contact">
              <strong>Email:</strong> arafat@gmail.com
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CitizenIssue;