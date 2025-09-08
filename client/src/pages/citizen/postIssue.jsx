import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/citizen/postIssue.css";

// Assume you have an AuthContext or similar to get the user's token
// import { useAuth } from '../../context/AuthContext'; 

function PostIssue() {
  // const { token } = useAuth(); // Example of getting token from context

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
    upazila: "",
    district: "",
    full_address: "",
    image: null, // Changed from imageUrl to image to hold the file object
  });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  // --- Assuming your API server is running on port 5000 ---
  const API_BASE_URL = "http://localhost:5000/api";


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

  const handleFileChange = (e) => {
    setFormData(prev => ({
        ...prev,
        image: e.target.files[0]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = "Issue title is required";
    if (!formData.description.trim()) newErrors.description = "Issue description is required";
    if (!formData.category) newErrors.category = "Please select a category";
    if (!formData.district.trim()) newErrors.district = "District is required";
    if (!formData.upazila.trim()) newErrors.upazila = "Upazila/Thana is required";
    if (!formData.full_address.trim()) newErrors.full_address = "Full address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setMessage(""); // Clear previous messages

    try {
        let imageUrl = "";

        // **STEP 1: Upload image if it exists**
        if (formData.image) {
            const imageFormData = new FormData();
            imageFormData.append('image', formData.image);

            try {
                const uploadRes = await axios.post(`${API_BASE_URL}/uploads/issue`, imageFormData);
                if (uploadRes.data.success) {
                    imageUrl = uploadRes.data.fileUrl;
                } else {
                    throw new Error(uploadRes.data.message || 'Image upload failed');
                }
            } catch (uploadError) {
                setMessage({ type: 'error', text: uploadError.response?.data?.message || "Error uploading image." });
                setIsSubmitting(false);
                return; // Stop submission if image upload fails
            }
        }

        // **STEP 2: Submit issue data (with optional imageUrl)**
        const issueData = {
            title: formData.title,
            description: formData.description,
            category: formData.category,
            priority: formData.priority,
            upazila: formData.upazila,
            district: formData.district,
            full_address: formData.full_address,
            image_url: imageUrl, // FIXED: Changed from 'imageUrl' to 'image_url' to match backend
        };

        const apiHeaders = {
            headers: {
              // 'Authorization': `Bearer ${token}` // Uncomment when AuthContext is integrated
            },
            withCredentials: true // Important for sending cookies if using cookie-based auth
        };

        const res = await axios.post(`${API_BASE_URL}/issues`, issueData, apiHeaders);
        
        setMessage({ type: 'success', text: res.data.message });
        // Reset form fields completely
        setFormData({
            title: "",
            description: "",
            category: "",
            priority: "medium",
            upazila: "",
            district: "",
            full_address: "",
            image: null,
        });
        // Clear file input visually
        document.getElementById("image").value = ""; 
        setErrors({});

    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || "Error submitting issue. Please try again."});
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="issue-page">
      <div className="hero-section">
      </div>

      <div className="issue-container">
        <div className="form-header">
          <h2>Submit Your Issue</h2>
          <p>Please provide detailed information to help us address your concern quickly and effectively.</p>
        </div>

        {message && (
          <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>
            <div className="alert-icon">
              {message.type === 'error' ? '⚠️' : '✅'}
            </div>
            <span>{message.text}</span>
          </div>
        )}

        <form className="issue-form" onSubmit={handleSubmit}>
          {/* Personal Information section has been removed */}

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

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="district">District *</label>
                    <input
                        id="district"
                        type="text"
                        name="district"
                        placeholder="e.g., Dhaka"
                        value={formData.district}
                        onChange={handleInputChange}
                        className={errors.district ? 'error' : ''}
                        required
                    />
                    {errors.district && <span className="error-text">{errors.district}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="upazila">Upazila / Thana *</label>
                    <input
                        id="upazila"
                        type="text"
                        name="upazila"
                        placeholder="e.g., Gulshan"
                        value={formData.upazila}
                        onChange={handleInputChange}
                        className={errors.upazila ? 'error' : ''}
                        required
                    />
                    {errors.upazila && <span className="error-text">{errors.upazila}</span>}
                </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="full_address">Full Address of Issue *</label>
              <input
                id="full_address"
                type="text"
                name="full_address"
                placeholder="Street address, landmark, or area where issue is located"
                value={formData.full_address}
                onChange={handleInputChange}
                className={errors.full_address ? 'error' : ''}
                required
              />
              {errors.full_address && <span className="error-text">{errors.full_address}</span>}
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
              <label htmlFor="image">Upload Image (Optional)</label>
              <input
                id="image"
                type="file"
                name="image"
                accept="image/*"
                onChange={handleFileChange}
              />
              <small className="form-hint">Choose an image that shows the issue</small>
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
      </div>
      <div className="hero-section">
      </div>
    </div>
    
  );
}

export default PostIssue;