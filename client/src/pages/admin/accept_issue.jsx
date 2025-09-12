import React, { useState } from 'react';
import '../../styles/admin/accept_issue.css';

const AcceptIssueModal = ({ isOpen, onClose, onAccept, issueId, issueTitle }) => {
	const [estimatedBudget, setEstimatedBudget] = useState('');
	const [estimatedTime, setEstimatedTime] = useState('');
	const [timeUnit, setTimeUnit] = useState('days');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errors, setErrors] = useState({});

	// Reset form when modal opens/closes
	React.useEffect(() => {
		if (isOpen) {
			setEstimatedBudget('');
			setEstimatedTime('');
			setTimeUnit('days');
			setErrors({});
		}
	}, [isOpen]);

	const validateForm = () => {
		const newErrors = {};

		if (!estimatedBudget || parseFloat(estimatedBudget) <= 0) {
			newErrors.budget = 'Please enter a valid budget amount';
		}

		if (!estimatedTime || parseFloat(estimatedTime) <= 0) {
			newErrors.time = 'Please enter a valid time estimate';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		
		if (!validateForm()) {
			return;
		}

		setIsSubmitting(true);
		
		try {
			const acceptanceData = {
				estimatedBudget: parseFloat(estimatedBudget),
				estimatedTime: parseFloat(estimatedTime),
				timeUnit: timeUnit
			};

			await onAccept(issueId, acceptanceData);
			onClose();
		} catch (error) {
			console.error('Error accepting issue:', error);
			setErrors({ submit: 'Failed to accept issue. Please try again.' });
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = () => {
		setEstimatedBudget('');
		setEstimatedTime('');
		setTimeUnit('days');
		setErrors({});
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="accept-modal-overlay" onClick={handleCancel}>
			<div className="accept-modal" onClick={(e) => e.stopPropagation()}>
				<div className="accept-modal-header">
					<h2 className="accept-modal-title">Accept Issue</h2>
					<button 
						className="accept-modal-close"
						onClick={handleCancel}
						type="button"
						aria-label="Close modal"
					>
						×
					</button>
				</div>

				<div className="accept-modal-content">
					<div className="issue-info">
						<h3 className="issue-title">Issue #{issueId}: {issueTitle}</h3>
						<p className="acceptance-note">
							Please provide your estimated budget and time to complete this issue.
						</p>
					</div>

					<form onSubmit={handleSubmit} className="accept-form">
						<div className="form-group">
							<label htmlFor="estimatedBudget" className="form-label">
								<span className="label-text">Estimated Budget</span>
								<span className="label-required">*</span>
							</label>
							<div className="budget-input-container">
								<input
									type="number"
									id="estimatedBudget"
									value={estimatedBudget}
									onChange={(e) => setEstimatedBudget(e.target.value)}
									placeholder="Enter amount"
									className={`form-input budget-input ${errors.budget ? 'error' : ''}`}
									min="0"
									step="0.01"
									disabled={isSubmitting}
									required
								/>
							</div>
							{errors.budget && <span className="error-message">{errors.budget}</span>}
						</div>

						<div className="form-group">
							<label htmlFor="estimatedTime" className="form-label">
								<span className="label-text">Estimated Time</span>
								<span className="label-required">*</span>
							</label>
							<div className="time-input-container">
								<input
									type="number"
									id="estimatedTime"
									value={estimatedTime}
									onChange={(e) => setEstimatedTime(e.target.value)}
									placeholder="Enter time"
									className={`form-input time-input ${errors.time ? 'error' : ''}`}
									min="0"
									step="0.5"
									disabled={isSubmitting}
									required
								/>
								<select
									value={timeUnit}
									onChange={(e) => setTimeUnit(e.target.value)}
									className="time-unit-select"
									disabled={isSubmitting}
								>
									<option value="hours">Hours</option>
									<option value="days">Days</option>
									<option value="weeks">Weeks</option>
								</select>
							</div>
							{errors.time && <span className="error-message">{errors.time}</span>}
						</div>

						{errors.submit && (
							<div className="submit-error">
								{errors.submit}
							</div>
						)}

						<div className="form-actions">
							<button
								type="button"
								onClick={handleCancel}
								className="btn-cancel"
								disabled={isSubmitting}
							>
								Cancel
							</button>
							<button
								type="submit"
								className="btn-accept-submit"
								disabled={isSubmitting}
							>
								{isSubmitting ? (
									<>
										<span className="loading-spinner"></span>
										Accepting...
									</>
								) : (
									'Accept Issue'
								)}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default AcceptIssueModal;
