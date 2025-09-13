import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AnimatedBackground from '../../components/AnimatedBackground';
import axios from 'axios';
import '../../styles/worker/home.css';

const WorkerHome = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalApplications: 0,
        assignedJobs: 0,
        completedJobs: 0,
        pendingApplications: 0,
        rating: 0,
        earnings: 0
    });
    const [recentJobs, setRecentJobs] = useState([]);
    const [availableIssues, setAvailableIssues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Mock data for now - replace with actual API calls
            setStats({
                totalApplications: 12,
                assignedJobs: 3,
                completedJobs: 8,
                pendingApplications: 1,
                rating: 4.7,
                earnings: 2450
            });

            setRecentJobs([
                {
                    id: 1,
                    title: "Fix Broken Street Light",
                    category: "Electricity & Street Lights",
                    priority: "high",
                    status: "in_progress",
                    location: "Main Street, Block A",
                    assignedDate: "2024-06-15",
                    estimatedCompletion: "2024-06-16"
                },
                {
                    id: 2,
                    title: "Repair Pothole",
                    category: "Road & Infrastructure", 
                    priority: "medium",
                    status: "assigned",
                    location: "Park Avenue",
                    assignedDate: "2024-06-14"
                }
            ]);

            setAvailableIssues([
                {
                    id: 3,
                    title: "Water Leak in Community Center",
                    category: "Water & Sanitation",
                    priority: "urgent",
                    location: "Community Center",
                    postedDate: "2024-06-16",
                    estimatedBudget: "$150-200"
                },
                {
                    id: 4,
                    title: "Garbage Collection Issue",
                    category: "Waste Management",
                    priority: "medium",
                    location: "Residential Area B",
                    postedDate: "2024-06-15",
                    estimatedBudget: "$80-120"
                }
            ]);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        {
            title: 'Browse Jobs',
            description: 'Find new job opportunities in your area',
            icon: '🔍',
            action: () => navigate('/worker?tab=issues'),
            color: '#3b82f6'
        },
        {
            title: 'My Applications',
            description: 'Track your job applications and progress',
            icon: '📋',
            action: () => navigate('/worker?tab=my-applications'),
            color: '#10b981'
        },
        {
            title: 'Submit Proof',
            description: 'Upload completion proof for assigned jobs',
            icon: '📸',
            action: () => navigate('/worker?tab=my-applications'),
            color: '#f59e0b'
        },
        {
            title: 'My Profile',
            description: 'Update skills and professional information',
            icon: '👤',
            action: () => navigate('/worker?tab=profile'),
            color: '#8b5cf6'
        }
    ];

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return '#dc3545';
            case 'high': return '#fd7e14';
            case 'medium': return '#ffc107';
            case 'low': return '#28a745';
            default: return '#6c757d';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return '#28a745';
            case 'in_progress': return '#17a2b8';
            case 'assigned': return '#ffc107';
            default: return '#6c757d';
        }
    };

    if (loading) {
        return (
            <div className="worker-home-loading">
                <div className="loading-spinner"></div>
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <AnimatedBackground>
            <div className="worker-home">
            {/* Welcome Section */}
            <div className="welcome-section">
                <div className="welcome-content">
                    <h1>Welcome back, {user?.name || 'Worker'}! 🔧</h1>
                    <p>Ready to help your community? Check out available jobs and track your progress.</p>
                </div>
                <div className="welcome-illustration">
                    <span className="worker-icon">🛠️</span>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-section">
                <div className="stats-grid">
                    <div className="stat-card total-applications">
                        <div className="stat-icon">📊</div>
                        <div className="stat-info">
                            <h3>{stats.totalApplications}</h3>
                            <p>Total Applications</p>
                        </div>
                    </div>
                    <div className="stat-card assigned">
                        <div className="stat-icon">🔧</div>
                        <div className="stat-info">
                            <h3>{stats.assignedJobs}</h3>
                            <p>Active Jobs</p>
                        </div>
                    </div>
                    <div className="stat-card completed">
                        <div className="stat-icon">✅</div>
                        <div className="stat-info">
                            <h3>{stats.completedJobs}</h3>
                            <p>Completed</p>
                        </div>
                    </div>
                    <div className="stat-card earnings">
                        <div className="stat-icon">💰</div>
                        <div className="stat-info">
                            <h3>${stats.earnings}</h3>
                            <p>Total Earnings</p>
                        </div>
                    </div>
                    <div className="stat-card rating">
                        <div className="stat-icon">⭐</div>
                        <div className="stat-info">
                            <h3>{stats.rating}/5</h3>
                            <p>Rating</p>
                        </div>
                    </div>
                    <div className="stat-card pending">
                        <div className="stat-icon">⏳</div>
                        <div className="stat-info">
                            <h3>{stats.pendingApplications}</h3>
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

            {/* Current Jobs */}
            <div className="current-jobs-section">
                <div className="section-header">
                    <h2>Current Jobs</h2>
                    <button 
                        className="view-all-btn"
                        onClick={() => navigate('/worker?tab=my-applications')}
                    >
                        View All
                    </button>
                </div>
                
                {recentJobs.length > 0 ? (
                    <div className="jobs-grid">
                        {recentJobs.map((job) => (
                            <div key={job.id} className="job-card">
                                <div className="job-header">
                                    <div className="job-category">{job.category}</div>
                                    <div 
                                        className="job-priority"
                                        style={{ backgroundColor: getPriorityColor(job.priority) }}
                                    >
                                        {job.priority}
                                    </div>
                                </div>
                                <h4>{job.title}</h4>
                                <p className="job-location">📍 {job.location}</p>
                                <div className="job-footer">
                                    <div 
                                        className="job-status"
                                        style={{ color: getStatusColor(job.status) }}
                                    >
                                        {job.status.replace('_', ' ')}
                                    </div>
                                    <div className="job-date">
                                        Assigned: {new Date(job.assignedDate).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-jobs">
                        <div className="no-jobs-icon">🔧</div>
                        <h3>No active jobs</h3>
                        <p>Browse available issues and apply for jobs!</p>
                        <button 
                            className="primary-btn"
                            onClick={() => navigate('/worker?tab=issues')}
                        >
                            Browse Jobs
                        </button>
                    </div>
                )}
            </div>

            {/* Available Issues */}
            <div className="available-issues-section">
                <div className="section-header">
                    <h2>New Opportunities</h2>
                    <button 
                        className="view-all-btn"
                        onClick={() => navigate('/worker?tab=issues')}
                    >
                        View All
                    </button>
                </div>
                
                <div className="issues-grid">
                    {availableIssues.map((issue) => (
                        <div key={issue.id} className="issue-card available">
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
                            <p className="issue-location">📍 {issue.location}</p>
                            <div className="issue-budget">{issue.estimatedBudget}</div>
                            <div className="issue-footer">
                                <div className="issue-date">
                                    Posted: {new Date(issue.postedDate).toLocaleDateString()}
                                </div>
                                <button 
                                    className="apply-btn"
                                    onClick={() => navigate('/worker?tab=issues')}
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tips Section */}
            <div className="tips-section">
                <h2>💡 Tips for Success</h2>
                <div className="tips-grid">
                    <div className="tip-card">
                        <span className="tip-icon">⚡</span>
                        <h4>Quick Response</h4>
                        <p>Apply quickly to increase chances of getting assigned</p>
                    </div>
                    <div className="tip-card">
                        <span className="tip-icon">📋</span>
                        <h4>Detailed Proposals</h4>
                        <p>Provide comprehensive work plans and realistic timelines</p>
                    </div>
                    <div className="tip-card">
                        <span className="tip-icon">🏆</span>
                        <h4>Quality Work</h4>
                        <p>Complete jobs well to maintain high ratings and get more work</p>
                    </div>
                </div>
            </div>
            </div>
        </AnimatedBackground>
    );
};

export default WorkerHome;