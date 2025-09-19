import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../../components/AnimatedBackground';
import ViewDetailsModal from '../common/view_details';
import EditIssueModal from '../common/edit_issue';
import '../../styles/citizen/mypost.css';

function MyPost() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // Data state
    const [posts, setPosts] = useState([]);
    const [stats, setStats] = useState(null);

    // UI state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [sortKey, setSortKey] = useState('created_desc');
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null); // For common details modal
    const [editOpen, setEditOpen] = useState(false);

    // Fetch posts and stats
    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            if (authLoading) return;
            if (!user) {
                setLoading(false);
                return;
            }
            setLoading(true);
            setError('');
            try {
                const [issuesRes, statsRes] = await Promise.all([
                    axios.get('/api/issues/user/recent', { params: { limit: 100 } }),
                    axios.get('/api/issues/user/stats')
                ]);

                if (!isMounted) return;
                const issues = issuesRes.data?.issues || issuesRes.data?.data || issuesRes.data || [];
                setPosts(Array.isArray(issues) ? issues : []);
                setStats(statsRes.data?.stats || null);
            } catch (err) {
                console.error('Failed to fetch my posts:', err);
                setError(err.response?.data?.message || 'Failed to load your posts');
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchData();
        return () => { isMounted = false; };
    }, [user, authLoading]);

    const reload = async () => {
        // Helper to refresh list after edit/delete
        try {
            setLoading(true);
            const issuesRes = await axios.get('/api/issues/user/recent', { params: { limit: 100 } });
            const issues = issuesRes.data?.issues || [];
            setPosts(Array.isArray(issues) ? issues : []);
        } catch (err) {
            console.error('Reload failed:', err);
        } finally {
            setLoading(false);
        }
    };

    // Helpers
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const statusColor = (status) => {
        const map = {
            submitted: '#6c757d',
            applied: '#17a2b8',
            assigned: '#7e57c2',
            in_progress: '#ff9800',
            under_review: '#9c27b0',
            resolved: '#4caf50',
            closed: '#263238'
        };
        return map[status] || '#6c757d';
    };

    const priorityColor = (p) => {
        const map = { low: '#8bc34a', medium: '#ffc107', high: '#ff7043', urgent: '#e53935' };
        return map[p] || '#9e9e9e';
    };

    const normalizedPosts = useMemo(() => {
        // Normalize server fields to a common shape used by UI
        return posts.map((p) => ({
            id: p.issue_id ?? p.ID ?? p.id,
            title: p.title ?? p.TITLE,
            description: p.description ?? p.DESCRIPTION,
            category: p.category ?? p.CATEGORY,
            priority: (p.priority ?? p.PRIORITY ?? 'medium').toLowerCase(),
            image_url: p.image_url ?? p.IMAGE_URL,
            status: (p.status ?? p.STATUS ?? 'submitted').toLowerCase(),
            created_at: p.created_at ?? p.CREATED_AT,
            updated_at: p.updated_at ?? p.UPDATED_AT,
            location: p.location ?? p.LOCATION,
            upazila: p.upazila ?? p.UPAZILA,
            district: p.district ?? p.DISTRICT
        }));
    }, [posts]);

    const filteredSortedPosts = useMemo(() => {
        let list = normalizedPosts;
        if (query.trim()) {
            const q = query.trim().toLowerCase();
            list = list.filter(
                (p) =>
                    p.title?.toLowerCase().includes(q) ||
                    p.description?.toLowerCase().includes(q) ||
                    p.category?.toLowerCase().includes(q) ||
                    p.location?.toLowerCase().includes(q)
            );
        }
        if (statusFilter !== 'all') {
            list = list.filter((p) => p.status === statusFilter);
        }
        if (priorityFilter !== 'all') {
            list = list.filter((p) => p.priority === priorityFilter);
        }
        const sorters = {
            created_desc: (a, b) => new Date(b.created_at) - new Date(a.created_at),
            created_asc: (a, b) => new Date(a.created_at) - new Date(b.created_at),
            priority_desc: (a, b) => ['low','medium','high','urgent'].indexOf(b.priority) - ['low','medium','high','urgent'].indexOf(a.priority),
            priority_asc: (a, b) => ['low','medium','high','urgent'].indexOf(a.priority) - ['low','medium','high','urgent'].indexOf(b.priority)
        };
        const sortFn = sorters[sortKey] || sorters.created_desc;
        return [...list].sort(sortFn);
    }, [normalizedPosts, query, statusFilter, priorityFilter, sortKey]);

    const handleDeletePost = async (postId) => {
        if (!postId) return;
        if (!window.confirm('Are you sure you want to delete this issue?')) return;
        try {
            await axios.delete(`/api/issues/${postId}`);
            setPosts((prev) => prev.filter((p) => (p.issue_id ?? p.ID ?? p.id) !== postId));
        } catch (err) {
            console.error('Delete failed:', err);
            alert(err.response?.data?.message || 'Failed to delete the issue');
        }
    };

    if (authLoading) {
        return (
            <AnimatedBackground>
                <div className="my-posts-wrapper">
                    <div className="loading-indicator">Checking your session…</div>
                </div>
            </AnimatedBackground>
        );
    }

    if (!user) {
        return (
            <AnimatedBackground>
                <div className="my-posts-wrapper">
                    <div className="no-posts-message">
                        <p>Please sign in to view your issues.</p>
                        <button className="create-first-post-button" onClick={() => navigate('/auth/login')}>
                            Go to Login
                        </button>
                    </div>
                </div>
            </AnimatedBackground>
        );
    }

    return (
        <AnimatedBackground>
            <div className="my-posts-wrapper">
                <h1>My Issues</h1>

                <div className="action-bar">
                    <button
                        className="new-post-button"
                        onClick={() => navigate('/citizen?tab=post-issue')}
                    >
                        Create New Issue
                    </button>
                </div>

                {stats && (
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-label">Total</div>
                            <div className="stat-value">{stats.totalIssues}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Pending</div>
                            <div className="stat-value">{stats.pendingIssues}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">In Progress</div>
                            <div className="stat-value">{stats.inProgressIssues}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Resolved</div>
                            <div className="stat-value">{stats.resolvedIssues}</div>
                        </div>
                    </div>
                )}

                <div className="filter-bar">
                    <input
                        type="text"
                        className="filter-input"
                        placeholder="Search by title, description, category, or location…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">All Statuses</option>
                        <option value="submitted">Submitted</option>
                        <option value="applied">Applied</option>
                        <option value="assigned">Assigned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="under_review">Under Review</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                    <select className="filter-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                        <option value="all">All Priorities</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                    </select>
                    <select className="filter-select" value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
                        <option value="created_desc">Newest</option>
                        <option value="created_asc">Oldest</option>
                        <option value="priority_desc">Priority High→Low</option>
                        <option value="priority_asc">Priority Low→High</option>
                    </select>
                </div>

                {loading ? (
                    <div className="loading-indicator">Loading your issues…</div>
                ) : error ? (
                    <div className="error-banner">{error}</div>
                ) : filteredSortedPosts.length === 0 ? (
                    <div className="no-posts-message">
                        <p>No issues match your filters.</p>
                        <button className="create-first-post-button" onClick={() => { setQuery(''); setStatusFilter('all'); setPriorityFilter('all'); }}>
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className="posts-container">
                        {filteredSortedPosts.map((post) => (
                            <div key={post.id} className="post-card">
                                <div className="post-header">
                                    <h3 className="post-title">{post.title}</h3>
                                    <div className="post-meta">
                                        <span className="badge status" style={{ backgroundColor: statusColor(post.status) }}>{post.status.replace('_', ' ')}</span>
                                        <span className="badge priority" style={{ backgroundColor: priorityColor(post.priority) }}>{post.priority}</span>
                                        <span className="post-date">{formatDate(post.created_at)}</span>
                                    </div>
                                </div>

                                {post.image_url && (
                                    <div className="post-image">
                                        <img src={post.image_url} alt={post.title} />
                                    </div>
                                )}

                                <div className="post-content">
                                    <div className="post-row">
                                        <span className="label">Category:</span>
                                        <span>{post.category}</span>
                                    </div>
                                    {(post.location || post.upazila || post.district) && (
                                        <div className="post-row">
                                            <span className="label">Location:</span>
                                            <span>{post.location ? `${post.location}` : ''}{post.upazila ? `${post.location ? ', ' : ''}${post.upazila}` : ''}{post.district ? `${(post.location || post.upazila) ? ', ' : ''}${post.district}` : ''}</span>
                                        </div>
                                    )}
                                    {post.description && (
                                        <p className="description">{post.description.length > 220 ? post.description.slice(0, 220) + '…' : post.description}</p>
                                    )}
                                </div>

                                <div className="post-actions">
                                    <button className="action-button view-button" onClick={() => { setSelectedId(post.id); setDetailsOpen(true); }}>
                                        View Details
                                    </button>
                                    {user?.user_type === 'citizen' && (
                                        <button className="action-button edit-button" onClick={() => { setSelectedId(post.id); setEditOpen(true); }}>
                                            Edit
                                        </button>
                                    )}
                                    <button className="action-button delete-button" onClick={() => handleDeletePost(post.id)}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <ViewDetailsModal isOpen={detailsOpen} onClose={() => { setDetailsOpen(false); setSelectedId(null); }} issueId={selectedId} />
            <EditIssueModal isOpen={editOpen} onClose={() => { setEditOpen(false); }} issueId={selectedId} onUpdated={reload} />
        </AnimatedBackground>
    );
}

export default MyPost;