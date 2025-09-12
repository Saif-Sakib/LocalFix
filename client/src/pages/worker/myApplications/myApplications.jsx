import React, { useState, useEffect } from 'react';
import Submit_proof from './submitProof';
import '../../../styles/worker/myApplications.css';

function MyApplications() {
    const [filter, setFilter] = useState('all');
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [is_submit_open, set_is_submit_open] = useState(false);
    const [selectedIssueId, setSelectedIssueId] = useState(null);

    // Sample data - replace with actual API call
    useEffect(() => {
        // This should be replaced with actual API call to fetch worker's applications
        const fetchApplications = async () => {
            try {
                // Mock data for now - replace with: const response = await fetch('/api/worker/applications');
                const mockApplications = [
                    {
                        id: 1,
                        title: "Leaky faucet",
                        location: "Kitchen",
                        category: "Plumbing",
                        priority: "medium",
                        status: "assigned", // Worker can submit proof
                        appliedDate: "2024-06-01",
                        assignedDate: "2024-06-02",
                        myProposal: "Replace faucet washer and check for leaks.",
                        adminNote: "Approved for assignment. Please start work immediately.",
                        description: "The kitchen faucet is leaking continuously.",
                        citizenName: "John Doe",
                        citizenContact: "+8801712345678"
                    },
                    {
                        id: 2,
                        title: "Broken window",
                        location: "Living Room",
                        category: "Carpentry",
                        priority: "high",
                        status: "applied", // Waiting for admin assignment
                        appliedDate: "2024-06-02",
                        myProposal: "Replace broken glass and reinforce frame.",
                        adminNote: null,
                        description: "Window in the living room is completely broken.",
                        citizenName: "Jane Smith",
                        citizenContact: "+8801812345679"
                    },
                    {
                        id: 3,
                        title: "Heating not working",
                        location: "Whole House",
                        category: "HVAC",
                        priority: "urgent",
                        status: "in_progress", // Can submit proof
                        appliedDate: "2024-06-03",
                        assignedDate: "2024-06-03",
                        startedDate: "2024-06-04",
                        myProposal: "Inspect boiler and repair heating system.",
                        adminNote: "Critical issue. Start immediately.",
                        description: "Central heating system is completely down.",
                        citizenName: "Bob Johnson",
                        citizenContact: "+8801912345680"
                    },
                    {
                        id: 4,
                        title: "Paint peeling",
                        location: "Bathroom",
                        category: "Painting",
                        priority: "low",
                        status: "under_review", // Proof submitted, waiting for verification
                        appliedDate: "2024-06-04",
                        assignedDate: "2024-06-05",
                        startedDate: "2024-06-06",
                        proofSubmittedDate: "2024-06-07",
                        myProposal: "Scrape old paint and repaint walls.",
                        adminNote: "Approved. Quality work expected.",
                        description: "Paint is peeling off the bathroom walls.",
                        citizenName: "Alice Brown",
                        citizenContact: "+8801612345677"
                    },
                    {
                        id: 5,
                        title: "Electrical outlet not working",
                        location: "Bedroom",
                        category: "Electrical",
                        priority: "medium",
                        status: "resolved", // Work completed and verified
                        appliedDate: "2024-05-28",
                        assignedDate: "2024-05-29",
                        startedDate: "2024-05-30",
                        proofSubmittedDate: "2024-05-31",
                        resolvedDate: "2024-06-01",
                        myProposal: "Replace faulty outlet and check wiring.",
                        adminNote: "Excellent work. Payment processed.",
                        description: "Bedroom electrical outlet is completely dead.",
                        citizenName: "Mike Wilson",
                        citizenContact: "+8801512345676"
                    }
                ];
                
                setApplications(mockApplications);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching applications:', error);
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    // Calculate counts dynamically
    const all_count = applications.length;
    const applied_count = applications.filter(a => a.status === 'applied').length;
    const assigned_count = applications.filter(a => a.status === 'assigned').length;
    const in_progress_count = applications.filter(a => a.status === 'in_progress').length;
    const under_review_count = applications.filter(a => a.status === 'under_review').length;
    const resolved_count = applications.filter(a => a.status === 'resolved').length;

    // Filter applications based on selected filter
    const filteredApplications = filter === 'all' ? applications : applications.filter(a => a.status === filter);

    const handleOpenModal = (issueId) => {
        setSelectedIssueId(issueId);
        set_is_submit_open(true);
    };

    const handleCloseModal = () => {
        set_is_submit_open(false);
        setSelectedIssueId(null);
    };

    const handleSubmitProof = async (proofData) => {
        try {
            // API call to submit proof
            // const response = await fetch(`/api/worker/submit-proof/${selectedIssueId}`, {...});
            
            // Update local state
            setApplications(prev => prev.map(app => 
                app.id === selectedIssueId 
                    ? { ...app, status: 'under_review', proofSubmittedDate: new Date().toISOString().split('T')[0] }
                    : app
            ));
            
            handleCloseModal();
        } catch (error) {
            console.error('Error submitting proof:', error);
        }
    };

    const handleStartWork = async (issueId) => {
        try {
            // API call to mark work as started
            // const response = await fetch(`/api/worker/start-work/${issueId}`, {...});
            
            setApplications(prev => prev.map(app => 
                app.id === issueId 
                    ? { ...app, status: 'in_progress', startedDate: new Date().toISOString().split('T')[0] }
                    : app
            ));
        } catch (error) {
            console.error('Error starting work:', error);
        }
    };

    if (loading) {
        return <div className="loading">Loading your applications...</div>;
    }

    return (
        <div className="my-applications-container">
            
            <div className="filter-buttons">
                <button className={`filter-button ${filter === 'all' ? 'selected' : ''}`} onClick={() => setFilter('all')}>
                    All ({all_count})
                </button>
                <button className={`filter-button ${filter === 'applied' ? 'selected' : ''}`} onClick={() => setFilter('applied')}>
                    Applied ({applied_count})
                </button>
                <button className={`filter-button ${filter === 'assigned' ? 'selected' : ''}`} onClick={() => setFilter('assigned')}>
                    Assigned ({assigned_count})
                </button>
                <button className={`filter-button ${filter === 'in_progress' ? 'selected' : ''}`} onClick={() => setFilter('in_progress')}>
                    In Progress ({in_progress_count})
                </button>
                <button className={`filter-button ${filter === 'under_review' ? 'selected' : ''}`} onClick={() => setFilter('under_review')}>
                    Under Review ({under_review_count})
                </button>
                <button className={`filter-button ${filter === 'resolved' ? 'selected' : ''}`} onClick={() => setFilter('resolved')}>
                    Resolved ({resolved_count})
                </button>
            </div>

            <div className="application-list">
                {filteredApplications.length === 0 ? (
                    <div className="no-applications">
                        <p>No applications found for the selected filter.</p>
                    </div>
                ) : (
                    filteredApplications.map(app => (
                        <div key={app.id} className="application-item">
                            <div className="application-content">
                                <div className="application-header">
                                    <h2>{app.title}</h2>
                                    
                                </div>
                                
                                <div className="basic-info-grid">
                                    <div className="info-item">
                                        <strong>Location:</strong> {app.location}
                                    </div>
                                    <div className="info-item">
                                        <strong>Category:</strong> {app.category}
                                    </div>
                                    <div className="info-item">
                                        <strong>Priority:</strong> 
                                        <span className={`priority-badge priority-${app.priority}`}>
                                            {app.priority.charAt(0).toUpperCase() + app.priority.slice(1)}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <strong>Applied:</strong> {app.appliedDate}
                                    </div>
                                    {app.assignedDate && (
                                        <div className="info-item">
                                            <strong>Assigned:</strong> {app.assignedDate}
                                        </div>
                                    )}
                                    {app.startedDate && (
                                        <div className="info-item">
                                            <strong>Started:</strong> {app.startedDate}
                                        </div>
                                    )}
                                </div>

                                <div className="description-section">
                                    <strong>Description:</strong>
                                    <p>{app.description}</p>
                                </div>

                                {app.citizenName && (
                                    <div className="citizen-info">
                                        <strong>Citizen:</strong> {app.citizenName}
                                        {app.citizenContact && (
                                            <span className="citizen-contact"> | {app.citizenContact}</span>
                                        )}
                                    </div>
                                )}

                                {app.myProposal && (
                                    <div className="proposal worker-proposal">
                                        <strong>My Proposal:</strong>
                                        <p>{app.myProposal}</p>
                                    </div>
                                )}

                                {app.adminNote && (
                                    <div className="proposal admin-note">
                                        <strong>Admin Note:</strong>
                                        <p>{app.adminNote}</p>
                                    </div>
                                )}
                            </div>

                            <div className="action-buttons">
                                {app.status === 'assigned' && (
                                    <>
                                        <button 
                                            className="action-btn start-work-btn"
                                            onClick={() => handleStartWork(app.id)}
                                        >
                                            <i className='bx bx-play-circle'></i>
                                            Start Work
                                        </button>
                                    </>
                                )}
                                
                                {app.status === 'in_progress' && (
                                    <button 
                                        className="action-btn submit-proof-btn"
                                        onClick={() => handleOpenModal(app.id)}
                                    >
                                        <i className='bx bx-camera'></i>
                                        Submit Proof
                                    </button>
                                )}

                                {app.status === 'applied' && (
                                    <div className="waiting-message">
                                        <i className='bx bx-time'></i>
                                        Waiting for assignment
                                    </div>
                                )}

                                {app.status === 'under_review' && (
                                    <div className="review-message">
                                        <i className='bx bx-check-circle'></i>
                                        Proof submitted - Under review
                                    </div>
                                )}

                                {app.status === 'resolved' && (
                                    <div className="completed-message">
                                        <i className='bx bx-badge-check'></i>
                                        Work completed
                                    </div>
                                )}

                                <button className="action-btn details-btn">
                                    <i className='bx bx-info-circle'></i>
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {is_submit_open && (
                <Submit_proof
                    isOpen={is_submit_open}
                    onClose={handleCloseModal}
                    onSubmit={handleSubmitProof}
                    issueId={selectedIssueId}
                />
            )}
        </div>
    );
}

export default MyApplications;