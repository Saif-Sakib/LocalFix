import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { PieChart, Pie, Cell } from "recharts";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import AnimatedBackground from "../../components/AnimatedBackground";
import "../../styles/admin/home.css";

function AdminHome() {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [month, set_month] = useState([]);
    const [category, set_category] = useState([]);
    const [average, set_average] = useState([]);
    const [stats, setStats] = useState({
        totalCitizens: 0,
        totalWorkers: 0,
        totalOpenIssues: 0,
        pendingIssues: 0,
        resolvedIssues: 0,
        totalApplications: 0,
        activeJobs: 0,
        completionRate: 0
    });
    const [loading, setLoading] = useState(true);

    const COLORS = ["#0088FE", "#00C49F", "#9b0ef3ff", "#FF8042", "#a2ac49ff"];

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // Use sample data instead of API calls
            setStats({
                totalCitizens: 247,
                totalWorkers: 89,
                totalOpenIssues: 23,
                pendingIssues: 8,
                resolvedIssues: 156,
                totalApplications: 5, // Sample applications count
                activeJobs: 15,
                completionRate: 87.2
            });

            set_month([
                { name: "Jan", Assigned: 10, Solved: 6 },
                { name: "Feb", Assigned: 12, Solved: 8 },
                { name: "Mar", Assigned: 15, Solved: 10 },
                { name: "Apr", Assigned: 20, Solved: 15 },
                { name: "May", Assigned: 25, Solved: 20 },
                { name: "Jun", Assigned: 30, Solved: 25 }
            ]);

            set_average([
                { date: "2025-08-19", avgResolution: 4.2, avgAdded: 6.1 },
                { date: "2025-08-20", avgResolution: 3.8, avgAdded: 5.9 },
                { date: "2025-08-21", avgResolution: 5.1, avgAdded: 7.3 },
                { date: "2025-08-22", avgResolution: 2.9, avgAdded: 4.8 },
                { date: "2025-08-23", avgResolution: 4.7, avgAdded: 6.5 },
                { date: "2025-08-24", avgResolution: 3.4, avgAdded: 5.2 },
                { date: "2025-08-25", avgResolution: 6.0, avgAdded: 8.1 },
                { date: "2025-08-26", avgResolution: 4.3, avgAdded: 6.7 },
                { date: "2025-08-27", avgResolution: 3.9, avgAdded: 5.8 },
                { date: "2025-08-28", avgResolution: 5.5, avgAdded: 7.2 },
                { date: "2025-08-29", avgResolution: 4.1, avgAdded: 6.3 },
                { date: "2025-08-30", avgResolution: 5.2, avgAdded: 7.1 },
                { date: "2025-08-31", avgResolution: 3.8, avgAdded: 6.4 },
                { date: "2025-09-01", avgResolution: 4.5, avgAdded: 5.9 },
                { date: "2025-09-02", avgResolution: 2.9, avgAdded: 4.8 },
                { date: "2025-09-03", avgResolution: 6.1, avgAdded: 8.2 },
                { date: "2025-09-04", avgResolution: 4.0, avgAdded: 6.7 },
                { date: "2025-09-05", avgResolution: 3.4, avgAdded: 5.1 },
                { date: "2025-09-06", avgResolution: 5.7, avgAdded: 7.8 },
                { date: "2025-09-07", avgResolution: 4.8, avgAdded: 6.9 }
            ]);

            set_category([
                { name: "Road & Infrastructure", value: 35 },
                { name: "Electricity & Lights", value: 28 },
                { name: "Water & Sanitation", value: 20 },
                { name: "Waste Management", value: 12 },
                { name: "Public Safety", value: 5 }
            ]);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            // Use fallback data
            setStats({
                totalCitizens: 247,
                totalWorkers: 89,
                totalOpenIssues: 23,
                pendingIssues: 8,
                resolvedIssues: 156,
                totalApplications: 5,
                activeJobs: 15,
                completionRate: 87.2
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const quickActions = [
        {
            title: 'Review Issues',
            description: 'Review and manage reported issues',
            icon: '📋',
            action: () => navigate('/admin?tab=issues'),
            color: '#3b82f6',
            count: stats.pendingIssues
        },
        {
            title: 'Worker Applications',
            description: 'Review and manage worker applications',
            icon: '�',
            action: () => navigate('/admin?tab=applications'),
            color: '#f59e0b',
            count: stats.totalApplications
        },
        {
            title: 'Review Problems',
            description: 'Review completed work submissions',
            icon: '�',
            action: () => navigate('/admin?tab=review-problems'),
            color: '#10b981',
            count: stats.activeJobs
        },
        {
            title: 'System Reports',
            description: 'Generate and view system reports',
            icon: '📊',
            action: () => navigate('/admin?tab=reports'),
            color: '#8b5cf6',
            count: null
        }
    ];

    function formatDateTicks(ticks, index, allTicks) {
        const date = new Date(ticks);
        const day = date.getDate();
        const month = date.toLocaleString("default", { month: "short" });
        const year = date.getFullYear();

        if (index === 0) return `${day} ${month}`;

        const prevDate = new Date(allTicks[index - 1]);

        if (
            date.getMonth() === prevDate.getMonth() &&
            date.getFullYear() === prevDate.getFullYear()
        ) {
            return `${day}`;
        }

        if (date.getFullYear() === prevDate.getFullYear()) {
            return `${month}`;
        }

        return `${year}`;
    }

    if (loading) {
        return (
            <div className="admin-home-loading">
                <div className="loading-spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <AnimatedBackground>
            <div className="admin-home">
            {/* Welcome Section */}
            <div className="welcome-section">
                <div className="welcome-content">
                    <h1>Welcome back, {user?.name || 'Admin'}! 👨‍💼</h1>
                    <p>Monitor system performance and manage community operations efficiently.</p>
                </div>
                <div className="welcome-illustration">
                    <span className="admin-icon">⚙️</span>
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
                            {action.count !== null && (
                                <div className="action-count">{action.count}</div>
                            )}
                            <div className="action-arrow">→</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Statistics Overview */}
            <div className="stats-overview">
                <h2>System Overview</h2>
                <div className="stats-grid">
                    <div className="stat-card users">
                        <div className="stat-icon">👥</div>
                        <div className="stat-info">
                            <h3>{stats.totalCitizens}</h3>
                            <p>Total Citizens</p>
                        </div>
                    </div>
                    <div className="stat-card workers">
                        <div className="stat-icon">🔧</div>
                        <div className="stat-info">
                            <h3>{stats.totalWorkers}</h3>
                            <p>Total Workers</p>
                        </div>
                    </div>
                    <div className="stat-card open-issues">
                        <div className="stat-icon">📋</div>
                        <div className="stat-info">
                            <h3>{stats.totalOpenIssues}</h3>
                            <p>Open Issues</p>
                        </div>
                    </div>
                    <div className="stat-card pending">
                        <div className="stat-icon">⏳</div>
                        <div className="stat-info">
                            <h3>{stats.pendingIssues}</h3>
                            <p>Pending Reviews</p>
                        </div>
                    </div>
                    <div className="stat-card resolved">
                        <div className="stat-icon">✅</div>
                        <div className="stat-info">
                            <h3>{stats.resolvedIssues}</h3>
                            <p>Resolved Issues</p>
                        </div>
                    </div>
                    <div className="stat-card completion">
                        <div className="stat-icon">📈</div>
                        <div className="stat-info">
                            <h3>{stats.completionRate}%</h3>
                            <p>Completion Rate</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-section">
                <div className="chart-row">
                    <div className="chart-card">
                        <h3>Category Analysis</h3>
                        <PieChart width={350} height={250}>
                            <Pie
                                data={category}
                                cx="50%"
                                cy="50%"
                                outerRadius={70}
                                dataKey="value"
                                label
                            >
                                {category.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </div>

                    <div className="chart-card">
                        <h3>Monthly Performance</h3>
                        <BarChart width={400} height={250} data={month}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Assigned" fill="#8884d8" />
                            <Bar dataKey="Solved" fill="#82ca9d" />
                        </BarChart>
                    </div>
                </div>

                <div className="chart-row">
                    <div className="chart-card full-width">
                        <h3>Activity Trends - Last 20 Days</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={average}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(tick, index) =>
                                        formatDateTicks(tick, index, average.map((d) => d.date))
                                    }
                                />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="avgResolution"
                                    stroke="#8884d8"
                                    strokeWidth={3}
                                    activeDot={{ r: 6 }}
                                    name="Avg Resolved"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="avgAdded"
                                    stroke="#82ca9d"
                                    strokeWidth={3}
                                    activeDot={{ r: 6 }}
                                    name="Avg Added"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            </div>
        </AnimatedBackground>
    );
}

export default AdminHome;