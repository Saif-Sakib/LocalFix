import React, { useState, useEffect } from 'react';
import '../../styles/common/profile.css';

function Profile() {
    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [profileData, setProfileData] = useState({
        userId: '001',
        name: 'John Doe',
        email: 'john.doe@admin.com',
        phone: '01522102027',
        address: '123 Admin Street, City, State',
        password: 'DBMS para dei',
        userType: 'Admin',
        status: 'Active'
    });

    const check_info = () => {
        // code to get the user information from database
    }

    useEffect(() => {
        check_info();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = () => {
        // Here you would typically make an API call to update the user data
        console.log('Saving profile data:', profileData);
        setIsEditing(false);
        
        // You can add API call here
        // updateUserProfile(profileData);
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset to original data if needed
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-title">
                    <h2>User Profile</h2>
                    <p>Manage your account information</p>
                </div>
                <div className="profile-actions">
                    {!isEditing ? (
                        <button 
                            className="edit-btn"
                            onClick={() => setIsEditing(true)}
                        >
                            <i className="bx bx-edit"></i> Edit Profile
                        </button>
                    ) : (
                        <div className="edit-actions">
                            <button 
                                className="save-btn"
                                onClick={handleSave}
                            >
                                <i className="bx bx-save"></i> Save
                            </button>
                            <button 
                                className="cancel-btn"
                                onClick={handleCancel}
                            >
                                <i className="bx bx-x"></i> Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="profile-content">
                <div className="profile-card">
                    <div className="profile-avatar">
                        <div className="avatar-placeholder">
                            <i className="bx bx-user"></i>
                        </div>
                        <div className="status-badge">
                            <span className={`status ${profileData.status.toLowerCase()}`}>
                                {profileData.status}
                            </span>
                        </div>
                    </div>

                    <div className="profile-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="userId">User ID</label>
                                <input
                                    type="text"
                                    id="userId"
                                    name="userId"
                                    value={profileData.userId}
                                    disabled={true} // User ID should not be editable
                                    className="form-input disabled"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="userType">User Type</label>
                                <select
                                    id="userType"
                                    name="userType"
                                    value={profileData.userType}
                                    disabled={true}
                                    className="form-input"
                                >
                                    <option value="Admin">Admin</option>
                                    <option value="Super Admin">Super Admin</option>
                                    <option value="Moderator">Moderator</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group full-width">
                                <label htmlFor="name">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={profileData.name}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="form-input"
                                    placeholder="Enter your full name"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={profileData.email}
                                    disabled={true}
                                    className="form-input"
                                    placeholder="Enter your email"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="phone">Phone Number</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={profileData.phone}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="form-input"
                                    placeholder="Enter your phone number"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group full-width">
                                <label htmlFor="address">Address</label>
                                <textarea
                                    id="address"
                                    name="address"
                                    value={profileData.address}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="form-input textarea"
                                    placeholder="Enter your address"
                                    rows="3"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <div className="password-field">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={profileData.password}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="form-input"
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={!isEditing}
                                    >
                                        <i className={`bx ${showPassword ? 'bx-hide' : 'bx-show'}`}></i>
                                    </button>
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="status">Status</label>
                                <select
                                    id="status"
                                    name="status"
                                    value={profileData.status}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="form-input"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;