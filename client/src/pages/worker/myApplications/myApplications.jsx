import React, { useState } from 'react';
import Submit_proof from './submitProof';
import '../../../styles/worker/myApplications.css';

function MyApplications() {
    const [filter, setFilter] = useState('all');
    const [issues, set_issues] = useState([
        {
            id: 1,
            title: "Leaky faucet",
            location: "Kitchen",
            category: "Plumbing",
            level: "Minor",
            status: "submitted",
            appliedDate: "2024-06-01",
            myProposal: "Replace faucet washer and check for leaks.",
            adminProposal: "Approved for inspection.",
            description: "The kitchen faucet is leaking.",
        },
        {
            id: 2,
            title: "Broken window",
            location: "Living Room",
            category: "Carpentry",
            level: "Major",
            status: "under_review",
            appliedDate: "2024-06-02",
            myProposal: "Replace broken glass and reinforce frame.",
            adminProposal: "Pending review.",
            description: "Window in the living room is broken.",
        },
        {
            id: 3,
            title: "Heating not working",
            location: "Whole House",
            category: "HVAC",
            level: "Critical",
            status: "accepted",
            appliedDate: "2024-06-03",
            myProposal: "Inspect boiler and repair heating system.",
            adminProposal: "Approved. Proceed with repair.",
            description: "Central heating system is not working.",
        },
        {
            id: 4,
            title: "Paint peeling",
            location: "Bathroom",
            category: "Painting",
            level: "Minor",
            status: "rejected",
            appliedDate: "2024-06-04",
            myProposal: "Scrape old paint and repaint walls.",
            // adminProposal: "Rejected due to budget constraints.",
            description: "Paint is peeling off the bathroom walls.",
        },
    ]);

    const [is_submit_open, set_is_submit_open] = useState(false);
    const [selectedIssueId, setSelectedIssueId] = useState(null);

    // Calculate counts dynamically
    const all_count = issues.length;
    const submitted_count = issues.filter(i => i.status === 'submitted').length;
    const under_review_count = issues.filter(i => i.status === 'under_review').length;
    const accepted_count = issues.filter(i => i.status === 'accepted').length;
    const rejected_count = issues.filter(i => i.status === 'rejected').length;

    // Filter issues based on selected filter
    const filteredIssues = filter === 'all' ? issues : issues.filter(i => i.status === filter);

    const handleOpenModal = (issueId) => {
        setSelectedIssueId(issueId);
        set_is_submit_open(true);
    };

    const handleCloseModal = () => {
        set_is_submit_open(false);
        setSelectedIssueId(null);
    };

    const handleSubmitProof = (e) => {
        e.preventDefault();
        // You can handle the proof submission here (e.g., send to server)
        handleCloseModal();
    };

    return (
        <div className="my-applications-container">
            <div className="filter-buttons">
                <button className={`filter-button ${filter === 'all' ? 'selected' : ''}`} onClick={() => setFilter('all')}>All {all_count}</button>
                <button className={`filter-button ${filter === 'submitted' ? 'selected' : ''}`} onClick={() => setFilter('submitted')}>Submitted {submitted_count}</button>
                <button className={`filter-button ${filter === 'under_review' ? 'selected' : ''}`} onClick={() => setFilter('under_review')}>Under Review {under_review_count}</button>
                <button className={`filter-button ${filter === 'accepted' ? 'selected' : ''}`} onClick={() => setFilter('accepted')}>Accepted {accepted_count}</button>
                <button className={`filter-button ${filter === 'rejected' ? 'selected' : ''}`} onClick={() => setFilter('rejected')}>Rejected {rejected_count}</button>
            </div>

            <div className="application-list">
                {filteredIssues.map(issue => (
                    <div key={issue.id} className="application-item">
                        <div style={{width: '90%'}}>
                            <h2>{issue.title}</h2>
                            <div 
                                style={{boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    marginBottom: '10px',
                                    backgroundColor: '#f9f9f9'
                                }}
                            >
                                <p><strong>Location:</strong> {issue.location}</p>
                                <div className="basic-info">
                                    <p><strong>Category:</strong> {issue.category}</p>
                                    <p><strong>Level:</strong> {issue.level}</p>
                                    <p><strong>Status:</strong> {issue.status}</p>
                                    <p><strong>Applied Date:</strong> {issue.appliedDate}</p>
                                </div>
                            </div>
                            {issue.myProposal && 
                                <div className="proposal" style={{backgroundColor: '#d8eaf4ff'}}>
                                    <p><strong>My Proposal:</strong> </p>
                                    <p>{issue.myProposal}</p>
                                </div>
                            }
                            {issue.adminProposal &&
                                <div className="proposal" style={{backgroundColor: '#feeafbff'}}>
                                    <p><strong>Admin Proposal:</strong> </p>
                                    <p>{issue.adminProposal}</p>
                                </div>
                            }
                        </div>
                        <div className="action-buttons">
                            <button style={{backgroundColor: '#fba300ff',color:'white'}} onClick={() => handleOpenModal(issue.id)}>
                                <i className='bx bx-camera'>Submit Proof</i> 
                            </button>
                            <button style={{backgroundColor: '#e9e9e9',color:'black'}}> 
                                <i className='bx bx-info-circle'>View Details</i>
                            </button>
                        </div>
                    </div>
                ))}
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