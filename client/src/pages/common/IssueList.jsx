import React, { useEffect, useState } from "react";
import axios from "axios";
import '../../styles/common/IssueList.css'; // Make sure this path matches your CSS file


function IssueList() {
	const [issues, setIssues] = useState([]);
	const [loading, setLoading] = useState(true);
	const [user_type, setUserType] = useState('admin');
	const [filter_issue, setFilterIssue] = useState('all');
	const [sort_by, setSortBy] = useState('date_desc');
	const [flippedCards, setFlippedCards] = useState(new Set());

	useEffect(() => {
		//code to get the user type
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
		setFlippedCards(prev => {
			const newSet = new Set(prev);
			if (newSet.has(issueId)) {
				newSet.delete(issueId);
			} else {
				newSet.add(issueId);
			}
			return newSet;
		});
	};

	const handleApply = (issueId) => {
		// Add your apply logic here
		console.log(`Apply for issue ${issueId}`);
	};

	const handlePayment = (issueId) => {
		// Add your payment logic here
		console.log(`Initiate payment for issue ${issueId}`);
	};

	const handlePaymentStatus = (issueId) => {
		// Add your payment status logic here
		console.log(`Check payment status for issue ${issueId}`);
	};

	const getPriorityClass = (priority) => {
		switch (priority?.toLowerCase()) {
			case 'high':
				return 'priority-high';
			case 'medium':
				return 'priority-medium';
			case 'low':
				return 'priority-low';
			case 'urgent':
				return 'priority-urgent';
			default:
				return 'priority-low';
		}
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
			<div className="header" style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
				<img 
					src="http://localhost:5000/uploads/logo.png" 
					alt="Logo" 
					style={{ width: '40px', height: '40px', marginRight: '10px' }}
					onError={(e) => e.target.style.display = 'none'}
				/>
				<select
					name="filter"
					id="filter"
					onChange={(e) => setFilterIssue(e.target.value)}
					className="filter-dropdown"
				>
					<option value="all">All Issues</option>
					<option value="submitted">Recent Issues</option>
					<option value="assigned">Assigned Issues</option>
					<option value="in_progress">Pending Issues</option>
					<option value="resolved">Solved Issues</option>
					<option value="closed">Paid</option>
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
						.slice() // copy array for sort
						.sort((a, b) => handle_sort_by(a, b))
						.map(issue => (
							<div className={`issue-card-container ${flippedCards.has(issue.ID) ? 'flipped' : ''}`} key={issue.ID}>
								<div className="issue-card">
									{/* Front Side */}
									<div className="card-front">
										<div className={`card-header ${issue.STATUS}`}>
											<h3 className="card-title">{issue.TITLE}</h3>
											<div className="card-badges">
												<span className="job-id">#{issue.ID}</span>
												<span className={`priority ${getPriorityClass(issue.PRIORITY)}`}>
													{issue.PRIORITY?.toUpperCase()}
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
													<span className="value">{issue.STATUS?.toUpperCase()}</span>
												</div>
											</div>

											<div className="created-date">
												<span className="date-label">{issue.STATUS=='resolved' || issue.STATUS=='closed' ? 'Resolved' : 'Posted'}</span>
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
												className="btn-apply"
												onClick={() => handleApply(issue.ID)}
											>
												Apply
											</button>
											<button
												className="btn-details"
												onClick={() => handleViewDetails(issue.ID)}
											>
												See Details
											</button>
										</div>
									</div>

									{/* Back Side */}
									<div className="card-back">
										<div className={`card-header ${issue.STATUS}`}>
											<h3 className="card-title">Issue Details</h3>
											<div className="card-badges">
												<span className="job-id">#{issue.ID}</span>
											</div>
										</div>

										<div className="card-body details-body">
											<div className="info-row">
												<div className="info-item">
													<span className="label">Full Description</span>
													<span className="value">{issue.DESCRIPTION}</span>
												</div>
											</div>

											<div className="info-row">
												<div className="info-item">
													<span className="label">Assigned To</span>
													<span className="value">{issue.ASSIGNED_TO || 'Not assigned'}</span>
												</div>
											</div>

											<div className="info-row">
												<div className="info-item">
													<span className="label">Estimated Cost</span>
													<span className="value">{issue.ESTIMATED_COST || 'TBD'}</span>
												</div>
											</div>

											{issue.IMAGE_URL && (
												<div className="info-row">
													<div className="info-item">
														<span className="label">Image</span>
														<p style={{fontSize: '12px', color: 'red'}}>
															Debug: {issue.IMAGE_URL}
														</p>
														<p style={{fontSize: '12px', color: 'blue'}}>
															Full path: http://localhost:5000/uploads/issues/{issue.IMAGE_URL}
														</p>
														<img 
															src={`http://localhost:5000/uploads/issues/${issue.IMAGE_URL}`} 
															alt="Issue" 
															className="issue-image" 
															onLoad={() => console.log('Image loaded successfully:', issue.IMAGE_URL)}
															onError={(e) => {
																console.log('Image failed to load:', issue.IMAGE_URL);
																console.log('Full path attempted:', e.target.src);
																e.target.style.border = '2px solid red';
																e.target.alt = 'Image failed to load';
															}}
														/>
													</div>
												</div>
											)}
										</div>

										<div className="card-footer">
											<button
												className="btn-details"
												onClick={() => handleViewDetails(issue.ID)}
											>
												Back
											</button>
											{user_type === 'admin' && issue.STATUS === 'resolved' && (
												<button
													className="payment-details"
													onClick={() => handlePayment(issue.ID)}
												>
													Pay Now
												</button>
											)}
											{user_type === 'admin' && issue.STATUS === 'closed' && (
												<button
													className="payment-details"
													onClick={() => handlePaymentStatus(issue.ID)}
												>
													Payment Status
												</button>
											)}
										</div>
									</div>
								</div>
							</div>
						))}
				</div>
			</div>
		</div>
	);
}

export default IssueList;