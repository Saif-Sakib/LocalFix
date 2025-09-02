import React, { useEffect, useState } from "react";
import axios from "axios";
import '../../styles/worker/IssueList.css'; // Make sure this path matches your CSS file

function IssueList() {
	const [issues, setIssues] = useState([]);
	const [loading, setLoading] = useState(true);

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

	const handleApply = (issueId) => {
		// Add your apply logic here
		console.log(`Applied for issue ${issueId}`);
	};

	const handleViewDetails = (issueId) => {
		// Add your view details logic here
		console.log(`View details for issue ${issueId}`);
	};

	const getPriorityClass = (priority) => {
		switch (priority?.toLowerCase()) {
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
		// <div className="issue-page">
		<div className="issue-page-container">

			<div className="header">
				<h1>Available Issues</h1>
				<p>Browse and apply for local maintenance issues</p>
			</div>

			<div className="issue-scrollpane">
				<div className="issues-grid">
					{issues.map(issue => (
						<div className="issue-card" key={issue.ID}>
							<div className="card-header">
								<h3 className="card-title">{issue.TITLE}</h3>
								<div className="card-badges">
									<span className="job-id">#{issue.ID}</span>
									<span className={`priority ${getPriorityClass(issue.PRIORITY)}`}>
										{issue.PRIORITY}
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
											<span className="value">{issue.DESCRIPTION}</span>
										</div>
									</div>
								)}

								<div className="work-details">
									<div className="detail-grid">
										{issue.ESTIMATED_HOURS && (
											<div className="detail-item">
												<span className="detail-label">Est. Hours</span>
												<span className="detail-value">{issue.ESTIMATED_HOURS}h</span>
											</div>
										)}
										{issue.BUDGET && (
											<div className="detail-item">
												<span className="detail-label">Budget</span>
												<span className="detail-value">${issue.BUDGET}</span>
											</div>
										)}
										{issue.STATUS && (
											<div className="detail-item">
												<span className="detail-label">Status</span>
												<span className="detail-value">{issue.STATUS}</span>
											</div>
										)}
									</div>
								</div>

								<div className="created-date">
									<span className="date-label">Posted</span>
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
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
		// </div>
	);
}

export default IssueList;