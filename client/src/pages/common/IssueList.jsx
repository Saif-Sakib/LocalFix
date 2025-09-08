import React, { useEffect, useState } from "react";
import { useAuth } from '../../context/AuthContext';
import axios from "axios";
import '../../styles/common/IssueList.css';

function IssueList() {
	const [issues, setIssues] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filter_issue, setFilterIssue] = useState('all');
	const [sort_by, setSortBy] = useState('date_desc');
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
		console.log(`View details for issue ${issueId}`);
	};

	const handleApply = async (issueId) => {
		try {
			// API call to apply for the issue
			const response = await axios.post(`http://localhost:5000/api/worker/apply/${issueId}`, {
				worker_id: user.user_id
			});
			
			if (response.data.success) {
				// Update local state to reflect the application
				setIssues(prevIssues => 
					prevIssues.map(issue => 
						issue.ID === issueId 
							? { ...issue, STATUS: 'applied' }
							: issue
					)
				);
				alert('Application submitted successfully!');
			}
		} catch (error) {
			console.error('Error applying for issue:', error);
			alert('Error applying for issue. Please try again.');
		}
	};

	const handlePayment = (issueId) => {
		console.log(`Initiate payment for issue ${issueId}`);
	};

	const handlePaymentStatus = (issueId) => {
		console.log(`Check payment status for issue ${issueId}`);
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
			default:
				return 'status-default';
		}
	};

	const getStatusDisplayText = (status) => {
		const statusMap = {
			'submitted': 'Open for Applications',
			'applied': 'Applications Received',
			'assigned': 'Worker Assigned',
			'in_progress': 'Work in Progress',
			'under_review': 'Under Review',
			'resolved': 'Completed',
			'closed': 'Closed'
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

	const canWorkerApply = (issue) => {
		return user_type === 'worker' && 
			   (issue.STATUS === 'submitted' || issue.STATUS === 'applied') &&
			   issue.ASSIGNED_WORKER_ID !== user.user_id;
	};

	const hasWorkerApplied = (issue) => {
		// This would typically come from a separate applications table
		// For now, we'll assume if status is 'applied' and we can see it, someone has applied
		return issue.STATUS === 'applied';
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
			<div className="header" style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
				<select
					name="filter"
					id="filter"
					onChange={(e) => setFilterIssue(e.target.value)}
					className="filter-dropdown"
				>
					<option value="all">All Issues</option>
					<option value="submitted">Open for Applications</option>
					<option value="applied">Applications Received</option>
					<option value="assigned">Worker Assigned</option>
					<option value="in_progress">Work in Progress</option>
					<option value="under_review">Under Review</option>
					<option value="resolved">Completed</option>
					<option value="closed">Closed</option>
				</select>
				<select
					name="sort_by"
					id="sort_by"
					onChange={e => setSortBy(e.target.value)}
					className="filter-dropdown"
				>
					<option value="date_desc">Sort by Date (Newest)</option>
					<option value="date_asc">Sort by Date (Oldest)</option>
					<option value="priority_desc">Sort by Priority (High-Low)</option>
					<option value="priority_asc">Sort by Priority (Low-High)</option>
					<option value="status">Sort by Status</option>
				</select>
			</div>

			<div className="issue-scrollpane">
				<div className="issues-grid">
					{issues
						.filter(issue => filter_issue === 'all' || filter_issue === issue.STATUS)
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
									
									{/* Worker Apply Button Logic */}
									{canWorkerApply(issue) && !hasWorkerApplied(issue) && (
										<button
											className="btn-apply"
											onClick={() => handleApply(issue.ID)}
										>
											Apply Now
										</button>
									)}
									
									{canWorkerApply(issue) && hasWorkerApplied(issue) && (
										<button
											className="btn-applied"
											disabled
										>
											Applied
										</button>
									)}

									{/* Citizen Payment Buttons */}
									{user_type === 'citizen' && issue.CITIZEN_ID === user.user_id && (
										<>
											{issue.STATUS === 'resolved' && (
												<button
													className="btn-payment"
													onClick={() => handlePayment(issue.ID)}
												>
													Make Payment
												</button>
											)}
											{issue.STATUS === 'closed' && (
												<button
													className="btn-payment-status"
													onClick={() => handlePaymentStatus(issue.ID)}
												>
													Payment Status
												</button>
											)}
										</>
									)}
								</div>
							</div>
						))}
				</div>
			</div>
		</div>
	);
}

export default IssueList;