import React, { useState, useEffect } from 'react';
import AnimatedBackground from '../../components/AnimatedBackground';
import ViewDetailsModal from '../common/view_details';
import '../../styles/admin/review_problem.css';

function ReviewProblems() {
    const [proofSubmissions, setProofSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIssueId, setSelectedIssueId] = useState(null);
    const [showViewDetails, setShowViewDetails] = useState(false);

    // Sample data for proof submissions
    const sampleProofSubmissions = [
        {
            proof_id: 1,
            issue_id: 21,
            issue_title: "Broken Water Pipe on Main Road",
            worker_id: 19,
            worker_name: "Ahmed Rahman",
            worker_email: "ahmed.rahman@email.com",
            worker_phone: "+880 1712-345678",
            worker_profile_image: "/uploads/profiles/profile-19-1757768759903-171969324.jpg",
            proof_photo: "/uploads/proofs/1757683305611-777696439.png",
            proof_description: "Water pipe has been successfully repaired. The leak has been stopped and water flow restored. All debris has been cleaned up and the road surface has been restored to its original condition.",
            submitted_at: "2024-01-15T14:30:00Z",
            verification_status: "pending",
            issue_location: "Dhanmondi, Dhaka",
            issue_category: "Water & Sanitation"
        },
        {
            proof_id: 2,
            issue_id: 18,
            issue_title: "Pothole Repair on University Road",
            worker_id: 22,
            worker_name: "Fatima Khatun", 
            worker_email: "fatima.khatun@email.com",
            worker_phone: "+880 1798-765432",
            worker_profile_image: "/uploads/profiles/profile-22-1757768759903-171969324.jpg",
            proof_photo: "/uploads/proofs/1757671245721-747356743.png",
            proof_description: "Pothole has been filled with high-quality asphalt. The surface has been leveled and compacted properly. Road marking has been restored where necessary.",
            submitted_at: "2024-01-14T16:45:00Z",
            verification_status: "pending",
            issue_location: "Gulshan, Dhaka",
            issue_category: "Roads & Transportation"
        },
        {
            proof_id: 3,
            issue_id: 15,
            issue_title: "Street Light Installation",
            worker_id: 25,
            worker_name: "Mohammad Ali",
            worker_email: "mohammad.ali@email.com", 
            worker_phone: "+880 1556-987654",
            worker_profile_image: "/uploads/profiles/profile-25-1757768759903-171969324.jpg",
            proof_photo: "/uploads/proofs/1757312892735-781821559.png",
            proof_description: "New LED street light has been installed and tested. All electrical connections are secure and the light is functioning properly. Installation meets all safety standards.",
            submitted_at: "2024-01-13T10:20:00Z",
            verification_status: "pending",
            issue_location: "Uttara, Dhaka",
            issue_category: "Electricity & Lighting"
        }
    ];

    useEffect(() => {
        // Simulate loading delay
        setTimeout(() => {
            setProofSubmissions(sampleProofSubmissions);
            setLoading(false);
        }, 1000);
    }, []);

    const handleViewDetails = (issueId) => {
        setSelectedIssueId(issueId);
        setShowViewDetails(true);
    };

    const handleAcceptProof = (proofId) => {
        setProofSubmissions(prev => 
            prev.map(submission => 
                submission.proof_id === proofId 
                    ? { ...submission, verification_status: 'approved' }
                    : submission
            )
        );
        alert('Worker Paid successfully!');
    };

    const handleRequestRevision = (proofId) => {
        const feedback = prompt('Please provide feedback for revision:');
        if (feedback) {
            setProofSubmissions(prev => 
                prev.map(submission => 
                    submission.proof_id === proofId 
                        ? { ...submission, verification_status: 'revision_requested', admin_feedback: feedback }
                        : submission
                )
            );
            alert('Revision request sent to worker!');
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'pending': return 'status-pending';
            case 'approved': return 'status-approved';
            case 'rejected': return 'status-rejected';
            case 'revision_requested': return 'status-revision';
            default: return 'status-pending';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Pending Review';
            case 'approved': return 'Approved';
            case 'rejected': return 'Rejected';
            case 'revision_requested': return 'Revision Requested';
            default: return 'Pending Review';
        }
    };

    return (
        <AnimatedBackground>
            <div className="review-problems-container">
                <div className="page-header">
                    <h1>Review Problem Solutions</h1>
                    <p className="page-subtitle">Review and verify worker-submitted proof of completed work</p>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading proof submissions...</p>
                    </div>
                ) : (
                    <div className="proof-submissions-grid">
                        {proofSubmissions.length === 0 ? (
                            <div className="no-submissions">
                                <div className="no-submissions-icon">📋</div>
                                <h3>No Proof Submissions</h3>
                                <p>There are no proof submissions to review at this time.</p>
                            </div>
                        ) : (
                            proofSubmissions.map((submission) => (
                                <div key={submission.proof_id} className="proof-submission-card">
                                    <div className="card-header">
                                        <div className="issue-info">
                                            <h3 className="issue-title">{submission.issue_title}</h3>
                                            <div className="issue-meta">
                                                <span className="issue-id">ID: #{submission.issue_id}</span>
                                                <span className="issue-category">{submission.issue_category}</span>
                                                <span className="issue-location">{submission.issue_location}</span>
                                            </div>
                                        </div>
                                        <div className={`verification-status ${getStatusClass(submission.verification_status)}`}>
                                            {getStatusText(submission.verification_status)}
                                        </div>
                                    </div>

                                    <div className="card-body">
                                        <div className="worker-section">
                                            <div className="worker-details">
                                                <h4 className="worker-name">{submission.worker_name}</h4>
                                                <p className="worker-contact">{submission.worker_email}</p>
                                                <p className="worker-contact">{submission.worker_phone}</p>
                                            </div>
                                        </div>

                                        <div className="submission-details">
                                            <div className="submission-date">
                                                <span className="date-label">Submitted:</span>
                                                <span className="date-value">
                                                    {new Date(submission.submitted_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>

                                            <div className="proof-content">
                                                <div className="proof-image">
                                                    <img 
                                                        src={`http://localhost:5000/api/uploads/image/proofs/${submission.proof_photo.split('/').pop()}`}
                                                        alt="Proof of work"
                                                        onError={(e) => {
                                                            e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NSA2NUgxMTVWOTVIODVWNjVaIiBmaWxsPSIjRDVEOURGIi8+CjxwYXRoIGQ9Ik05MCA3MEgxMTBWOTBIOTBWNzBaIiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTEwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM2QjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPgo=";
                                                        }}
                                                    />
                                                </div>
                                                <div className="proof-description">
                                                    <h5>Work Description:</h5>
                                                    <p>{submission.proof_description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card-actions">
                                        <button 
                                            className="btn btn-view-details"
                                            onClick={() => handleViewDetails(submission.issue_id)}
                                        >
                                            <span className="btn-icon">📖</span>
                                            View Details
                                        </button>
                                        
                                        {submission.verification_status === 'pending' && (
                                            <>
                                                <button 
                                                    className="btn btn-accept"
                                                    onClick={() => handleAcceptProof(submission.proof_id)}
                                                >
                                                    <span className="btn-icon">✅</span>
                                                    Pay Now
                                                </button>
                                                
                                                <button 
                                                    className="btn btn-revision"
                                                    onClick={() => handleRequestRevision(submission.proof_id)}
                                                >
                                                    <span className="btn-icon">🔄</span>
                                                    Request Revision
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* View Details Modal */}
                <ViewDetailsModal
                    isOpen={showViewDetails}
                    onClose={() => setShowViewDetails(false)}
                    issueId={selectedIssueId}
                />
            </div>
        </AnimatedBackground>
    );
}

export default ReviewProblems;