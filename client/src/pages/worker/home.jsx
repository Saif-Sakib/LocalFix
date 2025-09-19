import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AnimatedBackground from '../../components/AnimatedBackground';
import axios from 'axios';
import '../../styles/worker/home.css';

const WorkerHome = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalApplications: 0,
        activeJobs: 0,
        completedJobs: 0,
        pendingApplications: 0
    });
    const [recentJobs, setRecentJobs] = useState([]);
    const [availableIssues, setAvailableIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setError('');
            const [statsRes, appsRes, issuesRes] = await Promise.all([
                axios.get('/api/worker/stats'),
                axios.get('/api/worker/applications'),
                axios.get('/api/issues')
            ]);

            // Stats
            if (statsRes.data?.success && statsRes.data.stats) {
                const s = statsRes.data.stats;
                setStats({
                    totalApplications: s.totalApplications || 0,
                    activeJobs: s.activeJobs || 0,
                    completedJobs: s.completedJobs || 0,
                    pendingApplications: s.pendingApplications || 0
                });
            }

            // Recent jobs from applications + assigned issues (API already merges)
            const apps = appsRes.data?.applications || [];
            const normalizedJobs = apps.map(a => ({
                id: a.id || a.issue_id,
                title: a.title,
                category: a.category,
                priority: (a.priority || '').toLowerCase(),
                status: (a.status || a.applicationStatus || '').toLowerCase(),
                location: a.location || a.full_address,
                assignedDate: a.appliedDate || a.applied_at || a.lastUpdated,
            }));
            setRecentJobs(normalizedJobs.slice(0, 5));

            // Available issues from general issues that are open for applications
            const allIssues = issuesRes.data?.issues || [];
            const openIssues = allIssues.filter(i => (i.STATUS || i.status) && ['submitted','applied'].includes((i.STATUS || i.status).toLowerCase()));
            const normalizedIssues = openIssues.map(i => ({
                id: i.ISSUE_ID || i.issue_id || i.ID,
                title: i.TITLE || i.title,
                category: i.CATEGORY || i.category,
                priority: (i.PRIORITY || i.priority || '').toLowerCase(),
                location: i.LOCATION || i.location || `${i.UPAZILA || i.upazila || ''}${i.DISTRICT || i.district ? ', ' + (i.DISTRICT || i.district) : ''}`,
                postedDate: i.CREATED_AT || i.created_at
            }));
            setAvailableIssues(normalizedIssues.slice(0, 5));
        } catch (err) {
            console.error('Error fetching worker dashboard data:', err);
            setError(err.response?.data?.message || 'Failed to load worker dashboard');
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
        switch ((priority || '').toLowerCase()) {
            case 'urgent': return '#dc3545';
            case 'high': return '#fd7e14';
            case 'medium': return '#ffc107';
            case 'low': return '#28a745';
            default: return '#6c757d';
        }
    };

    const getStatusColor = (status) => {
        switch ((status || '').toLowerCase()) {
            case 'resolved':
            case 'completed': return '#28a745';
            case 'in_progress': return '#17a2b8';
            case 'assigned': return '#6f42c1';
            case 'applied': return '#20c997';
            case 'submitted': return '#ffc107';
            case 'under_review': return '#fd7e14';
            default: return '#6c757d';
        }
    };

    const formatDate = (d) => {
        if (!d) return '';
        const date = new Date(d);
        if (Number.isNaN(date.getTime())) return '';
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    };

    if (authLoading || loading) {
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
                            <h3>{stats.activeJobs}</h3>
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

            {/* Current Jobs (compact) */}
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
                    <div className="jobs-list">
                        {recentJobs.slice(0, 5).map((job) => (
                            <button
                                key={job.id}
                                className="job-row"
                                onClick={() => navigate('/worker?tab=my-applications')}
                                title="Open My Applications"
                            >
                                <span className="status-dot" style={{ backgroundColor: getStatusColor(job.status) }} />
                                <span className="row-title">{job.title}</span>
                                <span className="row-badge">{job.category}</span>
                                <span className="row-priority" style={{ color: getPriorityColor(job.priority) }}>{job.priority}</span>
                                <span className="row-date">{formatDate(job.assignedDate)}</span>
                            </button>
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

            {/* Available Issues (compact) */}
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
                
                {error && (
                    <div className="error-banner" style={{ marginBottom: 16 }}>{error}</div>
                )}
                <div className="issues-list">
                    {availableIssues.slice(0, 5).map((issue) => (
                        <button
                            key={issue.id}
                            className="issue-row"
                            onClick={() => navigate('/worker?tab=issues')}
                            title="Browse and apply"
                        >
                            <span className="status-dot" style={{ backgroundColor: getPriorityColor(issue.priority) }} />
                            <span className="row-title">{issue.title}</span>
                            <span className="row-badge">{issue.category}</span>
                            <span className="row-priority" style={{ color: getPriorityColor(issue.priority) }}>{issue.priority}</span>
                            <span className="row-date">{formatDate(issue.postedDate)}</span>
                        </button>
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