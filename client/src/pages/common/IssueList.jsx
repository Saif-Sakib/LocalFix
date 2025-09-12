import React, { useEffect, useState } from "react";
import { useAuth } from '../../context/AuthContext';
import axios from "axios";
import ViewDetailsModal from './view_details';
import ApplyJobModal from '../worker/apply_job';
import AcceptIssueModal from '../admin/accept_issue';
import '../../styles/common/IssueList.css';

function IssueList() {
	const [issues, setIssues] = useState([]);
	const [loading, setLoading] = useState(true);
	const [sort_by, setSortBy] = useState('date_desc');
	const [showModal, setShowModal] = useState(false);
	const [selectedIssueId, setSelectedIssueId] = useState(null);
	const [showApplyModal, setShowApplyModal] = useState(false);
	const [selectedIssueForApply, setSelectedIssueForApply] = useState(null);
	const [showAcceptModal, setShowAcceptModal] = useState(false);
	const [selectedIssueForAccept, setSelectedIssueForAccept] = useState(null);
	const { user } = useAuth();
	const user_type = user?.user_type;

	useEffect(() => {
		async function fetchIssues() {
			try {
				const res = await axios.get("http://localhost:5000/api/issues");
				setIssues(res.data.issues);
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		}
		fetchIssues();
	}, []);

	const handleViewDetails = (issueId) => {
		setSelectedIssueId(issueId);
		setShowModal(true);
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setSelectedIssueId(null);
	};

	const handleAccept = async (issueId, acceptanceData = null) => {
		try {
			console.log(`Accepting issue ${issueId}`, acceptanceData);
			
			// For now, we just use the existing status update API
			// The budget and time data is logged for demonstration
			if (acceptanceData) {
				console.log('Budget and time data (for demo):', {
					budget: `$${acceptanceData.estimatedBudget}`,
					time: `${acceptanceData.estimatedTime} ${acceptanceData.timeUnit}`,
					issueId: issueId
				});
				
				// In a real implementation, this data would be sent to a specialized endpoint
				// For now, we just update the status to 'accepted'
			}
			
			// Use existing API to update status to 'accepted'
			const response = await axios.put(`http://localhost:5000/api/issues/${issueId}/status`, { 
				status: 'accepted' 
			});
			console.log('Status update response:', response.data);
			
			// Update local state
			setIssues(prev => prev.map(issue => 
				issue.ID === issueId 
					? { ...issue, STATUS: 'accepted' }
					: issue
			));
			
			alert(`Issue accepted successfully! ${acceptanceData ? `Budget: $${acceptanceData.estimatedBudget}, Time: ${acceptanceData.estimatedTime} ${acceptanceData.timeUnit}` : ''}`);
		} catch (error) {
			console.error('Error accepting issue:', error);
			alert('Error accepting issue. Please try again.');
			throw error; // Re-throw to handle in modal
		}
	};

	const handleShowAcceptModal = (issueId) => {
		const issue = issues.find(issue => issue.ID === issueId);
		setSelectedIssueForAccept(issue);
		setShowAcceptModal(true);
	};

	const handleCloseAcceptModal = () => {
		setShowAcceptModal(false);
		setSelectedIssueForAccept(null);
	};

	const handleReject = async (issueId) => {
		try {
			console.log(`Rejecting issue ${issueId}`);
			// API call to reject the issue
			// const response = await axios.put(`http://localhost:5000/api/issues/${issueId}/reject`);
			
			// Update local state
			setIssues(prev => prev.map(issue => 
				issue.ID === issueId 
					? { ...issue, STATUS: 'rejected' }
					: issue
			));
			// alert('Issue rejected successfully!');
		} catch (error) {
			console.error('Error rejecting issue:', error);
			alert('Error rejecting issue. Please try again.');
		}
	};

	const handleApply = async (issueId) => {
		// Find the issue to get its title
		const issue = issues.find(issue => issue.ID === issueId);
		setSelectedIssueForApply(issue);
		setShowApplyModal(true);
	};

	const handleCloseApplyModal = () => {
		setShowApplyModal(false);
		setSelectedIssueForApply(null);
	};

	const getPriorityClass = (priority) => {
		switch (priority?.toLowerCase()) {
			case 'urgent':
				return 'priority-urgent';
			case 'high':
				return 'priority-high';
			case 'medium':
				return 'priority-medium';
			case 'low':
				return 'priority-low';
			default:
				return 'priority-medium';
		}
	};

	const getStatusClass = (status) => {
		switch (status?.toLowerCase()) {
			case 'submitted':
				return 'status-submitted';
			case 'applied':
				return 'status-applied';
			case 'accepted':
				return 'status-accepted';
			case 'assigned':
				return 'status-assigned';
			case 'in_progress':
				return 'status-in-progress';
			case 'under_review':
				return 'status-under-review';
			case 'resolved':
				return 'status-resolved';
			case 'closed':
				return 'status-closed';
			case 'rejected':
				return 'status-rejected';
			default:
				return 'status-default';
		}
	};

	const getStatusDisplayText = (status) => {
		const statusMap = {
			'submitted': 'Pending',
			'applied': 'Applications Received',
			'accepted': 'Accepted',
			'assigned': 'Worker Assigned',
			'in_progress': 'Work in Progress',
			'under_review': 'Under Review',
			'resolved': 'Completed',
			'closed': 'Closed',
			'rejected': 'Rejected'
		};
		return statusMap[status?.toLowerCase()] || status;
	};

	const truncateText = (text, maxLength = 40) => {
		if (!text) return '';
		if (text.length <= maxLength) return text;
		return text.slice(0, maxLength) + '...';
	};

	const handle_sort_by = (a, b) => {
		if (sort_by === 'date_desc') {
			return new Date(b.CREATED_AT) - new Date(a.CREATED_AT);
		} else if (sort_by === 'date_asc') {
			return new Date(a.CREATED_AT) - new Date(b.CREATED_AT);
		} else if (sort_by === 'priority_desc') {
			const prio = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
			return (prio[b.PRIORITY?.toLowerCase()] || 0) - (prio[a.PRIORITY?.toLowerCase()] || 0);
		} else if (sort_by === 'priority_asc') {
			const prio = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
			return (prio[a.PRIORITY?.toLowerCase()] || 0) - (prio[b.PRIORITY?.toLowerCase()] || 0);
		} else if (sort_by === 'status') {
			return a.STATUS.localeCompare(b.STATUS);
		}
		return 0;
	};

	if (loading) {
		return (
			<div className="loading-container">
				Loading issues...
			</div>
		);
	}

	if (issues.length === 0) {
		return (
			<div className="issue-page">
				<div className="container">
					<div className="empty-state">
						<h3>No Issues Found</h3>
						<p>There are currently no issues reported.</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="issue-page-container">
			<div className="filters-section">
				<div className="filters-header">
					<h2 className="page-title">Issue Management</h2>
					<div className="filters-count">
						<span className="total-count">
							{issues.length} Total Issues
						</span>
					</div>
				</div>
				
				<div className="filters-container">
					<div className="filter-group">
						<label htmlFor="sort_by" className="filter-label">
							<i className="filter-icon">⚡</i>
							Sort By
						</label>
						<select
							name="sort_by"
							id="sort_by"
							value={sort_by}
							onChange={e => setSortBy(e.target.value)}
							className="filter-select"
						>
							<option value="date_desc">📅 Newest First</option>
							<option value="date_asc">📅 Oldest First</option>
							<option value="priority_desc">🔥 High Priority First</option>
							<option value="priority_asc">❄️ Low Priority First</option>
							<option value="status">📊 By Status</option>
						</select>
					</div>

					<div className="filter-actions">
						<button 
							className="clear-filters-btn"
							onClick={() => {
								setSortBy('date_desc');
							}}
							title="Reset all filters"
						>
							🔄 Reset
						</button>
					</div>
				</div>
			</div>

			<div className="issue-scrollpane">
				<div className="issues-grid">
					{issues
						.slice()
						.sort((a, b) => handle_sort_by(a, b))
						.map(issue => (
							<div className="issue-card" key={issue.ID}>
								<div className={`card-header ${getStatusClass(issue.STATUS)}`}>
									<h3 className="card-title">{issue.TITLE}</h3>
									<div className="card-badges">
										<span className="job-id">#{issue.ID}</span>
										<span className={`priority ${getPriorityClass(issue.PRIORITY)}`}>
											{issue.PRIORITY?.toUpperCase() || 'MEDIUM'}
										</span>
									</div>
								</div>

								<div className="card-body">
									<div className="info-row">
										<div className="info-item">
											<span className="label">Location</span>
											<span className="value">{issue.LOCATION}</span>
										</div>
									</div>

									<div className="info-row">
										<div className="info-item">
											<span className="label">Category</span>
											<span className="value">{issue.CATEGORY}</span>
										</div>
									</div>

									{issue.DESCRIPTION && (
										<div className="info-row">
											<div className="info-item">
												<span className="label">Description</span>
												<span className="value">{truncateText(issue.DESCRIPTION)}</span>
											</div>
										</div>
									)}

									<div className="info-row">
										<div className="info-item">
											<span className="label">Status</span>
											<span className={`value status-text ${getStatusClass(issue.STATUS)}`}>
												{getStatusDisplayText(issue.STATUS)}
											</span>
										</div>
									</div>

									{/* Show assigned worker info if available */}
									{issue.ASSIGNED_WORKER_ID && issue.ASSIGNED_WORKER_NAME && (
										<div className="info-row">
											<div className="info-item">
												<span className="label">Assigned Worker</span>
												<span className="value">{issue.ASSIGNED_WORKER_NAME}</span>
											</div>
										</div>
									)}

									<div className="created-date">
										<span className="date-label">
											{['resolved', 'closed'].includes(issue.STATUS) ? 'Completed' : 'Posted'}
										</span>
										<span className="date-value">
											{new Date(issue.CREATED_AT).toLocaleDateString('en-US', {
												year: 'numeric',
												month: 'short',
												day: 'numeric',
												hour: '2-digit',
												minute: '2-digit'
											})}
										</span>
									</div>
								</div>

								<div className="card-footer">
									<button
										className="btn-details"
										onClick={() => handleViewDetails(issue.ID)}
									>
										View Details
									</button>

									{user_type === 'admin' && (
										<>
											<button
												className="btn-accept"
												onClick={() => handleShowAcceptModal(issue.ID)}
												disabled={issue.STATUS !== 'submitted'}
											>
												Accept
											</button>
											<button
												className="btn-reject"
												onClick={() => handleReject(issue.ID)}
												disabled={issue.STATUS !== 'submitted'}
											>
												Reject
											</button>
										</>
									)}

									{user_type === 'worker' && (
										<button className="btn-apply" onClick={() => handleApply(issue.ID)}>
											Apply
										</button>
									)}
									
								</div>
							</div>
						))}
				</div>
			</div>

			{/* View Details Modal */}
			<ViewDetailsModal 
				isOpen={showModal}
				onClose={handleCloseModal}
				issueId={selectedIssueId}
			/>

			{/* Apply Job Modal */}
			<ApplyJobModal
				isOpen={showApplyModal}
				onClose={handleCloseApplyModal}
				issueId={selectedIssueForApply?.ID}
				issueTitle={selectedIssueForApply?.TITLE}
			/>

			{/* Accept Issue Modal */}
			<AcceptIssueModal
				isOpen={showAcceptModal}
				onClose={handleCloseAcceptModal}
				onAccept={handleAccept}
				issueId={selectedIssueForAccept?.ID}
				issueTitle={selectedIssueForAccept?.TITLE}
			/>
		</div>
	);
}

export default IssueList;