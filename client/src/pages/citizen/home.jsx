import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AnimatedBackground from '../../components/AnimatedBackground';
import axios from 'axios';
import '../../styles/citizen/home.css';

const CitizenHome = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalIssues: 0,
        resolvedIssues: 0,
        pendingIssues: 0,
        inProgressIssues: 0
    });
    const [recentIssues, setRecentIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setError('');
            const [statsResponse, recentResponse] = await Promise.all([
                axios.get('/api/issues/user/stats'),
                axios.get('/api/issues/user/recent', { params: { limit: 10 } })
            ]);

            if (statsResponse.data?.success && statsResponse.data.stats) {
                setStats(statsResponse.data.stats);
            }
            const issues = recentResponse.data?.issues || [];
            setRecentIssues(Array.isArray(issues) ? issues : []);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError(err.response?.data?.message || 'Failed to load dashboard');
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
            title: 'My Issues',
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

    const totals = useMemo(() => {
        const t = Math.max(0, Number(stats.totalIssues) || 0);
        const resolved = Math.max(0, Number(stats.resolvedIssues) || 0);
        const inProg = Math.max(0, Number(stats.inProgressIssues) || 0);
        const pending = Math.max(0, Number(stats.pendingIssues) || 0);
        const active = pending + inProg;
        const resolvedPct = t ? Math.round((resolved / t) * 100) : 0;
        const pendingPct = t ? Math.round((pending / t) * 100) : 0;
        const inProgPct = t ? Math.round((inProg / t) * 100) : 0;
        return { t, resolved, inProg, pending, active, resolvedPct, pendingPct, inProgPct };
    }, [stats]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const topCategories = useMemo(() => {
        const counts = {};
        recentIssues.forEach(i => {
            const c = (i.category || '').trim();
            if (!c) return;
            counts[c] = (counts[c] || 0) + 1;
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([name, count]) => ({ name, count }));
    }, [recentIssues]);

    if (authLoading || loading) {
        return (
            <div className="citizen-home-loading">
                <div className="loading-spinner"></div>
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <AnimatedBackground>
                <div className="citizen-home">
                    <div className="no-issues" style={{ marginTop: 24 }}>
                        <div className="no-issues-icon">🔐</div>
                        <h3>Please sign in</h3>
                        <p>Sign in to view your citizen dashboard and manage your issues.</p>
                        <button className="primary-btn" onClick={() => navigate('/auth/login')}>Go to Login</button>
                    </div>
                </div>
            </AnimatedBackground>
        );
    }

    return (
        <AnimatedBackground>
            <div className="citizen-home">
            {/* Welcome Section */}
            <div className="welcome-section">
                <div className="welcome-content">
                    <h1>Welcome back, {user?.name || 'Citizen'}! 👋</h1>
                    <p>
                        Track your issues at a glance. You currently have {totals.active} active
                        {totals.active === 1 ? ' issue' : ' issues'}.
                    </p>
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
                {/* Status Overview Progress */}
                <div className="status-overview">
                    <div className="status-overview-header">
                        <h3>Status overview</h3>
                        <div className="status-overview-meta">
                            <span className="badge" style={{ backgroundColor: '#fd7e14' }}>Pending {totals.pendingPct}%</span>
                            <span className="badge" style={{ backgroundColor: '#17a2b8' }}>In Progress {totals.inProgPct}%</span>
                            <span className="badge" style={{ backgroundColor: '#28a745' }}>Resolved {totals.resolvedPct}%</span>
                        </div>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-segment pending" style={{ width: `${totals.pendingPct}%` }} />
                        <div className="progress-segment in-progress" style={{ width: `${totals.inProgPct}%` }} />
                        <div className="progress-segment resolved" style={{ width: `${totals.resolvedPct}%` }} />
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

            {/* Recent Issues + Activity */}
            <div className="recent-issues-section">
                <div className="section-header">
                    <h2>Your Recent Activity</h2>
                    <button 
                        className="view-all-btn"
                        onClick={() => navigate('/citizen?tab=my-jobs')}
                    >
                        View All
                    </button>
                </div>
                {error && (
                    <div className="error-banner" style={{ marginBottom: 16 }}>{error}</div>
                )}
                {recentIssues.length > 0 ? (
                    <>
                        <div className="issues-list">
                            {recentIssues.slice(0, 3).map((issue) => (
                                <button
                                    key={issue.issue_id}
                                    className="issue-row"
                                    onClick={() => navigate('/citizen?tab=my-jobs')}
                                    title="View in My Issues"
                                >
                                    <span
                                        className="status-dot"
                                        style={{ backgroundColor: getStatusColor(issue.status) }}
                                        aria-hidden
                                    />
                                    <span className="row-title">{issue.title}</span>
                                    <span className="row-badge">{issue.category}</span>
                                    <span className="row-priority" style={{ color: getPriorityColor(issue.priority) }}>{issue.priority}</span>
                                    <span className="row-date">{formatDate(issue.updated_at || issue.created_at)}</span>
                                </button>
                            ))}
                        </div>
                        <div className="mini-insights">
                            <div className="mini-item">
                                <span className="mini-label">Active</span>
                                <span className="mini-value">{totals.active}</span>
                            </div>
                            <div className="mini-item">
                                <span className="mini-label">Resolved</span>
                                <span className="mini-value">{totals.resolvedPct}%</span>
                            </div>
                            <div className="mini-item">
                                <span className="mini-label">Top category</span>
                                <span className="mini-value">{topCategories[0]?.name || '—'}</span>
                            </div>
                        </div>
                    </>
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

            {/* Helpful Tips */}
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
                        <span className="tip-icon">⚖️</span>
                        <h4>Set Priority</h4>
                        <p>Choose an appropriate priority to help triage effectively</p>
                    </div>
                </div>
            </div>
            </div>
        </AnimatedBackground>
    );
};

export default CitizenHome;