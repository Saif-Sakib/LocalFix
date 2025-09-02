import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import '../../styles/common/profile.css';

function Profile() {
    const { user, refreshUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    // Initialize profile data from AuthContext user or with defaults
    const [profileData, setProfileData] = useState({
        userId: '',
        name: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        userType: '',
        status: 'Active'
    });

    // Original data to revert changes on cancel
    const [originalData, setOriginalData] = useState({});

    // Update profile data when user changes (from AuthContext)
    useEffect(() => {
        if (user) {
            const userData = {
                userId: user.user_id || '',
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                password: '', // Never populate password field
                userType: user.user_type || '',
                status: user.status || 'Active'
            };
            setProfileData(userData);
            setOriginalData(userData);
        }
    }, [user]);

    // Fetch fresh profile data from API
    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // The authToken cookie will be automatically included
            const response = await axios.get('/api/auth/profile');
            
            if (response.data.success) {
                const userData = response.data.user;
                const formattedData = {
                    userId: userData.user_id || '',
                    name: userData.name || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    address: userData.address || '',
                    password: '', // Never populate password field
                    userType: userData.user_type || '',
                    status: userData.status || 'Active'
                };
                
                setProfileData(formattedData);
                setOriginalData(formattedData);
            } else {
                setError('Failed to fetch profile data');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setError(error.response?.data?.message || 'Failed to fetch profile data');
        } finally {
            setLoading(false);
        }
    };

    // Update profile data on the server
    const updateProfile = async (updatedData) => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            // Prepare data for API (exclude password if empty, include only changed fields)
            const updatePayload = {
                name: updatedData.name,
                phone: updatedData.phone,
                address: updatedData.address,
            };

            // Only include password if it's been changed
            if (updatedData.password && updatedData.password.trim() !== '') {
                updatePayload.password = updatedData.password;
            }

            const response = await axios.put('/api/auth/profile', updatePayload);
            
            if (response.data.success) {
                setSuccess('Profile updated successfully');
                
                // Refresh the user data in AuthContext
                await refreshUser();
                
                // Clear password field after successful update
                setProfileData(prev => ({ ...prev, password: '' }));
                
                return { success: true };
            } else {
                setError(response.data.message || 'Failed to update profile');
                return { success: false };
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            const errorMessage = error.response?.data?.message || 'Failed to update profile';
            setError(errorMessage);
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear messages when user starts editing
        if (error) setError(null);
        if (success) setSuccess(null);
    };

    const handleSave = async () => {
        const result = await updateProfile(profileData);
        if (result.success) {
            setIsEditing(false);
            setOriginalData({ ...profileData, password: '' });
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setProfileData(originalData);
        setError(null);
        setSuccess(null);
    };

    const handleRefresh = () => {
        fetchProfile();
    };

    // Show loading spinner if initial load or if no user data
    if (loading && !user) {
        return (
            <div className="profile-container">
                <div className="loading-spinner">
                    <i className="bx bx-loader-alt bx-spin"></i>
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

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
                            disabled={loading}
                        >
                            <i className="bx bx-edit"></i> Edit Profile
                        </button>
                    ) : (
                        <div className="edit-actions">
                            <button 
                                className="save-btn"
                                onClick={handleSave}
                                disabled={loading}
                            >
                                <i className={`bx ${loading ? 'bx-loader-alt bx-spin' : 'bx-save'}`}></i>
                                {loading ? 'Saving...' : 'Save'}
                            </button>
                            <button 
                                className="cancel-btn"
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                <i className="bx bx-x"></i> Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Status Messages */}
            {error && (
                <div className="alert alert-error">
                    <i className="bx bx-error-circle"></i>
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="alert alert-success">
                    <i className="bx bx-check-circle"></i>
                    <span>{success}</span>
                </div>
            )}

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
                                    disabled={true} // User type should not be editable by user
                                    className="form-input disabled"
                                >
                                    <option value="Admin">Admin</option>
                                    <option value="Super Admin">Super Admin</option>
                                    <option value="Moderator">Moderator</option>
                                    <option value="User">User</option>
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
                                    disabled={true} // Email should not be editable (used for login)
                                    className="form-input disabled"
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
                                <label htmlFor="password">New Password</label>
                                <div className="password-field">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={profileData.password}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="form-input"
                                        placeholder={isEditing ? "Enter new password (leave blank to keep current)" : "••••••••"}
                                    />
                                    {isEditing && (
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            <i className={`bx ${showPassword ? 'bx-hide' : 'bx-show'}`}></i>
                                        </button>
                                    )}
                                </div>
                                {isEditing && (
                                    <small className="form-hint">
                                        Leave blank to keep your current password
                                    </small>
                                )}
                            </div>
                            <div className="form-group">
                                <label htmlFor="status">Status</label>
                                <select
                                    id="status"
                                    name="status"
                                    value={profileData.status}
                                    onChange={handleInputChange}
                                    disabled={!isEditing || profileData.userType !== 'Super Admin'} // Only super admin can change status
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