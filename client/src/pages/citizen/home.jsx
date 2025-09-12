import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import '../../styles/citizen/home.css';

const CitizenHome = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalIssues: 0,
        resolvedIssues: 0,
        pendingIssues: 0,
        inProgressIssues: 0
    });
    const [recentIssues, setRecentIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch user's issues statistics - updated API call
            const statsResponse = await axios.get('http://localhost:5000/api/issues/user/stats', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (statsResponse.data.success) {
                setStats(statsResponse.data.stats);
            }

            // Fetch recent issues - updated API call
            const recentResponse = await axios.get('http://localhost:5000/api/issues/user/recent?limit=3', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (recentResponse.data.success) {
                setRecentIssues(recentResponse.data.issues);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Handle authentication errors
            if (error.response?.status === 401) {
                console.error('Authentication failed - redirecting to login');
                // You might want to redirect to login here
            }
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        {
            title: 'Report New Issue',
            description: 'Report a problem in your community',
            icon: '📝',
            action: () => navigate('/citizen?tab=post-issue'),
            color: '#3b82f6'
        },
        {
            title: 'My Posts',
            description: 'View and manage your reported issues',
            icon: '📋',
            action: () => navigate('/citizen?tab=my-jobs'),
            color: '#10b981'
        },
        {
            title: 'Browse Issues',
            description: 'See what others are reporting',
            icon: '🔍',
            action: () => navigate('/citizen?tab=view-issues'),
            color: '#f59e0b'
        },
        {
            title: 'My Profile',
            description: 'Update your personal information',
            icon: '👤',
            action: () => navigate('/citizen?tab=profile'),
            color: '#8b5cf6'
        }
    ];

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'urgent': return '#dc3545';
            case 'high': return '#fd7e14';
            case 'medium': return '#ffc107';
            case 'low': return '#28a745';
            default: return '#6c757d';
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'resolved': return '#28a745';
            case 'in_progress': return '#17a2b8';
            case 'assigned': return '#6f42c1';
            case 'applied': return '#20c997';
            case 'submitted': return '#ffc107';
            case 'under_review': return '#fd7e14';
            case 'closed': return '#6c757d';
            default: return '#6c757d';
        }
    };

    const getStatusDisplayText = (status) => {
        const statusMap = {
            'submitted': 'Pending Review',
            'applied': 'Applications Received',
            'assigned': 'Worker Assigned',
            'in_progress': 'Work in Progress',
            'under_review': 'Under Review',
            'resolved': 'Completed',
            'closed': 'Closed'
        };
        return statusMap[status?.toLowerCase()] || status;
    };

    if (loading) {
        return (
            <div className="citizen-home-loading">
                <div className="loading-spinner"></div>
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="citizen-home">
            {/* Welcome Section */}
            <div className="welcome-section">
                <div className="welcome-content">
                    <h1>Welcome back, {user?.name || 'Citizen'}! 👋</h1>
                    <p>Help make your community better by reporting issues and staying engaged.</p>
                </div>
                <div className="welcome-illustration">
                    <span className="community-icon">🏘️</span>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-section">
                <div className="stats-grid">
                    <div className="stat-card total">
                        <div className="stat-icon">📊</div>
                        <div className="stat-info">
                            <h3>{stats.totalIssues}</h3>
                            <p>Total Issues</p>
                        </div>
                    </div>
                    <div className="stat-card resolved">
                        <div className="stat-icon">✅</div>
                        <div className="stat-info">
                            <h3>{stats.resolvedIssues}</h3>
                            <p>Resolved</p>
                        </div>
                    </div>
                    <div className="stat-card in-progress">
                        <div className="stat-icon">🔄</div>
                        <div className="stat-info">
                            <h3>{stats.inProgressIssues}</h3>
                            <p>In Progress</p>
                        </div>
                    </div>
                    <div className="stat-card pending">
                        <div className="stat-icon">⏳</div>
                        <div className="stat-info">
                            <h3>{stats.pendingIssues}</h3>
                            <p>Pending</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-section">
                <h2>Quick Actions</h2>
                <div className="actions-grid">
                    {quickActions.map((action, index) => (
                        <div 
                            key={index} 
                            className="action-card"
                            onClick={action.action}
                            style={{ '--action-color': action.color }}
                        >
                            <div className="action-icon">{action.icon}</div>
                            <div className="action-content">
                                <h3>{action.title}</h3>
                                <p>{action.description}</p>
                            </div>
                            <div className="action-arrow">→</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Issues */}
            <div className="recent-issues-section">
                <div className="section-header">
                    <h2>Your Recent Issues</h2>
                    <button 
                        className="view-all-btn"
                        onClick={() => navigate('/citizen?tab=my-jobs')}
                    >
                        View All
                    </button>
                </div>
                
                {recentIssues.length > 0 ? (
                    <div className="issues-grid">
                        {recentIssues.map((issue) => (
                            <div key={issue.issue_id} className="issue-card">
                                <div className="issue-header">
                                    <div className="issue-category">{issue.category}</div>
                                    <div 
                                        className="issue-priority"
                                        style={{ backgroundColor: getPriorityColor(issue.priority) }}
                                    >
                                        {issue.priority}
                                    </div>
                                </div>
                                <h4>{issue.title}</h4>
                                <p className="issue-description">{issue.description}</p>
                                <div className="issue-footer">
                                    <div 
                                        className="issue-status"
                                        style={{ color: getStatusColor(issue.status) }}
                                    >
                                        {getStatusDisplayText(issue.status)}
                                    </div>
                                    <div className="issue-date">
                                        {new Date(issue.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-issues">
                        <div className="no-issues-icon">📝</div>
                        <h3>No issues reported yet</h3>
                        <p>Start by reporting your first community issue!</p>
                        <button 
                            className="primary-btn"
                            onClick={() => navigate('/citizen?tab=post-issue')}
                        >
                            Report Issue
                        </button>
                    </div>
                )}
            </div>

            {/* Tips Section */}
            <div className="tips-section">
                <h2>💡 Tips for Better Reporting</h2>
                <div className="tips-grid">
                    <div className="tip-card">
                        <span className="tip-icon">📸</span>
                        <h4>Add Photos</h4>
                        <p>Include clear images to help workers understand the issue better</p>
                    </div>
                    <div className="tip-card">
                        <span className="tip-icon">📍</span>
                        <h4>Be Specific</h4>
                        <p>Provide exact location details and comprehensive descriptions</p>
                    </div>
                    <div className="tip-card">
                        <span className="tip-icon">⚡</span>
                        <h4>Set Priority</h4>
                        <p>Choose appropriate priority level to help workers prioritize</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CitizenHome;