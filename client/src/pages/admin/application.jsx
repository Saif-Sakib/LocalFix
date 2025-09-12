import { useState, useEffect } from 'react';
import '../../styles/admin/application.css';

function Application() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState({}); // Store feedback for each application

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = () => {
        // Sample applications data - multiple workers applying for same jobs
        const sampleApplications = [
            // Job 1: Street Light Repair - 3 workers applied
            {
                application_id: 1,
                job_id: 1,
                job_title: "Street Light Repair - Main Road",
                issue_description: "Multiple street lights on Main Street have been out for the past week, creating safety concerns for pedestrians and drivers.",
                issue_image: "/uploads/issue_img/1757312892735-781821559.png",
                location: "Main Street, Block A, Dhanmondi, Dhaka-1205",
                worker: {
                    id: 101,
                    name: "Ahmed Rahman",
                    phone: "+880 1712-345678"
                },
                estimated_cost: 4800.00,
                estimated_time: "2 days",
                proposal: "I am a certified electrician with 5 years of experience. I can fix this electrical issue quickly and safely. I have all the necessary tools and equipment.",
                applied_at: "2025-09-12T10:30:00Z",
                status: "pending"
            },
            {
                application_id: 2,
                job_id: 1, // Same job as above
                job_title: "Street Light Repair - Main Road",
                issue_description: "Multiple street lights on Main Street have been out for the past week, creating safety concerns for pedestrians and drivers.",
                issue_image: "/uploads/issue_img/1757312892735-781821559.png",
                location: "Main Street, Block A, Dhanmondi, Dhaka-1205",
                worker: {
                    id: 102,
                    name: "Karim Hassan",
                    phone: "+880 1723-456789"
                },
                estimated_cost: 5200.00,
                estimated_time: "3 days",
                proposal: "I have 8 years of experience in electrical work. I can provide high-quality repair with 1-year warranty on my work.",
                applied_at: "2025-09-12T11:15:00Z",
                status: "pending"
            },
            {
                application_id: 3,
                job_id: 1, // Same job as above
                job_title: "Street Light Repair - Main Road",
                issue_description: "Multiple street lights on Main Street have been out for the past week, creating safety concerns for pedestrians and drivers.",
                issue_image: "/uploads/issue_img/1757312892735-781821559.png",
                location: "Main Street, Block A, Dhanmondi, Dhaka-1205",
                worker: {
                    id: 103,
                    name: "Rafiq Ahmed",
                    phone: "+880 1734-567890"
                },
                estimated_cost: 4500.00,
                estimated_time: "1.5 days",
                proposal: "I am an experienced electrician specializing in street lighting. I can complete this work efficiently with minimal disruption to traffic.",
                applied_at: "2025-09-12T14:20:00Z",
                status: "pending"
            },
            
            // Job 2: Road Repair - 2 workers applied
            {
                application_id: 4,
                job_id: 2,
                job_title: "Road Repair - Pothole Fix",
                issue_description: "Several large potholes have formed on Gulshan Avenue causing damage to vehicles and creating traffic hazards.",
                issue_image: null,
                location: "Gulshan Avenue, Gulshan-1, Dhaka-1212",
                worker: {
                    id: 104,
                    name: "Nasir Uddin",
                    phone: "+880 1745-678901"
                },
                estimated_cost: 14500.00,
                estimated_time: "3 days",
                proposal: "My team has all the necessary equipment for road repair. We can complete this pothole repair within the deadline with high-quality materials.",
                applied_at: "2025-09-11T14:15:00Z",
                status: "pending"
            },
            {
                application_id: 5,
                job_id: 2, // Same job as above
                job_title: "Road Repair - Pothole Fix",
                issue_description: "Several large potholes have formed on Gulshan Avenue causing damage to vehicles and creating traffic hazards.",
                issue_image: null,
                location: "Gulshan Avenue, Gulshan-1, Dhaka-1212",
                worker: {
                    id: 105,
                    name: "Shahid Islam",
                    phone: "+880 1756-789012"
                },
                estimated_cost: 13800.00,
                estimated_time: "2 days",
                proposal: "I have extensive experience in road construction and repair. I use premium quality materials and can complete the work faster than estimated.",
                applied_at: "2025-09-11T16:45:00Z",
                status: "pending"
            },

            // Job 3: Drainage Cleaning - 1 worker applied
            {
                application_id: 6,
                job_id: 3,
                job_title: "Drainage System Cleaning",
                issue_description: "The main drainage system is blocked causing water to accumulate on the street during rain.",
                issue_image: null,
                location: "Sector 7, Road 12, Uttara, Dhaka-1230",
                worker: {
                    id: 106,
                    name: "Abdul Kalam",
                    phone: "+880 1767-890123"
                },
                estimated_cost: 7500.00,
                estimated_time: "1 day",
                proposal: "I have experience with municipal drainage systems and can clear this blockage efficiently. I will use proper tools and ensure the drainage flows smoothly.",
                applied_at: "2025-09-10T09:45:00Z",
                status: "pending"
            }
        ];

        setApplications(sampleApplications);
        setLoading(false);
    };

    const handleAcceptApplication = (applicationId, jobId) => {
        const applicationFeedback = feedback[applicationId] || '';
        
        setApplications(prevApplications => 
            prevApplications.map(app => {
                if (app.job_id === jobId) {
                    if (app.application_id === applicationId) {
                        return { ...app, status: "accepted", feedback: applicationFeedback };
                    } else {
                        return { ...app, status: "rejected", feedback: "Application not selected for this job." };
                    }
                }
                return app;
            })
        );
        
        // Clear feedback after use
        setFeedback(prev => {
            const newFeedback = { ...prev };
            delete newFeedback[applicationId];
            return newFeedback;
        });
        
        alert("Application accepted! All other applications for this job have been automatically rejected.");
    };

    const handleRejectApplication = (applicationId) => {
        const applicationFeedback = feedback[applicationId] || '';
        
        setApplications(prevApplications => 
            prevApplications.map(app => 
                app.application_id === applicationId 
                    ? { ...app, status: "rejected", feedback: applicationFeedback }
                    : app
            )
        );
        
        // Clear feedback after use
        setFeedback(prev => {
            const newFeedback = { ...prev };
            delete newFeedback[applicationId];
            return newFeedback;
        });
        
        alert("Application rejected!");
    };

    const handleFeedbackChange = (applicationId, feedbackText) => {
        setFeedback(prev => ({
            ...prev,
            [applicationId]: feedbackText
        }));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: 'BDT'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-BD', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Group applications by job
    const groupedApplications = applications.reduce((groups, app) => {
        const jobId = app.job_id;
        if (!groups[jobId]) {
            groups[jobId] = [];
        }
        groups[jobId].push(app);
        return groups;
    }, {});

    if (loading) {
        return (
            <div className="applications-container">
                <div className="loading">Loading applications...</div>
            </div>
        );
    }

    return (
        <div className="applications-container">
            <div className="applications-header">
                <h1>Worker Applications</h1>
                <p>Review and manage worker applications for approved jobs</p>
            </div>

            {Object.keys(groupedApplications).length === 0 ? (
                <div className="no-applications">
                    <p>No applications found.</p>
                </div>
            ) : (
                <div className="jobs-list">
                    {Object.entries(groupedApplications).map(([jobId, jobApplications]) => {
                        const firstApp = jobApplications[0];
                        return (
                            <div key={jobId} className="job-group">
                                <div className="job-header">
                                    <h2>{firstApp.job_title}</h2>
                                    <div className="job-details">
                                        <p><strong>Description:</strong> {firstApp.issue_description}</p>
                                        <p><strong>Location:</strong> {firstApp.location}</p>
                                        {firstApp.issue_image && (
                                            <div className="job-image">
                                                <img src={`http://localhost:5000${firstApp.issue_image}`} alt="Issue" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="applications-grid">
                                    {jobApplications.map((application) => (
                                        <div key={application.application_id} className={`application-card ${application.status}`}>
                                            <div className="application-header">
                                                <div className="worker-info">
                                                    <div className="worker-avatar">
                                                        {application.worker.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="worker-details">
                                                        <h3>{application.worker.name}</h3>
                                                        <p>ID: {application.worker.id}</p>
                                                        <p>Phone: {application.worker.phone}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="application-body">
                                                <div className="cost-time-info">
                                                    <div className="cost-info">
                                                        <label>Estimated Cost:</label>
                                                        <span className="cost-value">{formatCurrency(application.estimated_cost)}</span>
                                                    </div>
                                                    <div className="time-info">
                                                        <label>Estimated Time:</label>
                                                        <span className="time-value">{application.estimated_time}</span>
                                                    </div>
                                                </div>

                                                <div className="proposal-section">
                                                    <h4>Worker's Proposal:</h4>
                                                    <p>{application.proposal}</p>
                                                </div>

                                                <div className="application-meta">
                                                    <p className="applied-date">Applied: {formatDate(application.applied_at)}</p>
                                                </div>

                                                {application.feedback && (
                                                    <div className="feedback-section">
                                                        <h4>Admin Feedback:</h4>
                                                        <p>{application.feedback}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {application.status === "pending" && (
                                                <div className="application-actions">
                                                    <div className="feedback-input">
                                                        <label htmlFor={`feedback-${application.application_id}`}>
                                                            Feedback (Optional):
                                                        </label>
                                                        <textarea
                                                            id={`feedback-${application.application_id}`}
                                                            placeholder="Provide feedback for this application..."
                                                            value={feedback[application.application_id] || ''}
                                                            onChange={(e) => handleFeedbackChange(application.application_id, e.target.value)}
                                                            rows={3}
                                                        />
                                                    </div>
                                                    <div className="action-buttons">
                                                        <button 
                                                            className="accept-btn"
                                                            onClick={() => handleAcceptApplication(application.application_id, application.job_id)}
                                                        >
                                                            Accept Application
                                                        </button>
                                                        <button 
                                                            className="reject-btn"
                                                            onClick={() => handleRejectApplication(application.application_id)}
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Application;