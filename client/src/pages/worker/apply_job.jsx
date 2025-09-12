import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import '../../styles/worker/apply_job.css';

const ApplyJobModal = ({ isOpen, onClose, issueId, issueTitle }) => {
    const [estimatedBudget, setEstimatedBudget] = useState('');
    const [estimatedTime, setEstimatedTime] = useState('');
    const [timeUnit, setTimeUnit] = useState('days');
    const [proposal, setProposal] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!estimatedBudget || !estimatedTime || !proposal.trim()) {
            alert('Please fill in all required fields including your proposal');
            return;
        }

        if (parseFloat(estimatedBudget) <= 0) {
            alert('Budget must be greater than 0');
            return;
        }

        if (parseFloat(estimatedTime) <= 0) {
            alert('Estimated time must be greater than 0');
            return;
        }

        setIsSubmitting(true);

        try {
            const applicationData = {
                issueId: issueId,
                workerId: user.id,
                estimatedBudget: parseFloat(estimatedBudget),
                estimatedTime: parseFloat(estimatedTime),
                timeUnit: timeUnit,
                proposal: proposal.trim()
            };

            // API call to submit the application
            const response = await axios.post(`http://localhost:5000/api/issues/${issueId}/apply`, applicationData);
            
            alert('Application submitted successfully!');
            onClose();
            
            // Reset form
            setEstimatedBudget('');
            setEstimatedTime('');
            setTimeUnit('days');
            setProposal('');
            
        } catch (error) {
            console.error('Error submitting application:', error);
            alert('Error submitting application. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        // Reset form and close modal
        setEstimatedBudget('');
        setEstimatedTime('');
        setTimeUnit('days');
        setProposal('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="apply-job-modal">
                <div className="modal-header">
                    <h2>Apply for Job</h2>
                    <button className="close-btn" onClick={handleCancel}>×</button>
                </div>

                <div className="modal-content">
                    <div className="job-info">
                        <h3>Job: {issueTitle}</h3>
                        <p>Please provide your estimated budget and completion time for this job.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="application-form">
                        <div className="form-group">
                            <label htmlFor="estimatedBudget">Estimated Budget ($)</label>
                            <input
                                type="number"
                                id="estimatedBudget"
                                value={estimatedBudget}
                                onChange={(e) => setEstimatedBudget(e.target.value)}
                                placeholder="Enter your estimated budget"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="estimatedTime">Estimated Time</label>
                            <div className="time-input-group">
                                <input
                                    type="number"
                                    id="estimatedTime"
                                    value={estimatedTime}
                                    onChange={(e) => setEstimatedTime(e.target.value)}
                                    placeholder="Enter time"
                                    min="0"
                                    step="0.5"
                                    required
                                />
                                <select
                                    value={timeUnit}
                                    onChange={(e) => setTimeUnit(e.target.value)}
                                    className="time-unit-select"
                                >
                                    <option value="hours">Hours</option>
                                    <option value="days">Days</option>
                                    <option value="weeks">Weeks</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="proposal">Work Proposal *</label>
                            <textarea
                                id="proposal"
                                value={proposal}
                                onChange={(e) => setProposal(e.target.value)}
                                placeholder="Describe your approach, experience, tools you'll use, and why you're the best choice for this job..."
                                rows={4}
                                required
                                className="proposal-textarea"
                            />
                            <small className="field-help">
                                Provide details about your experience, methodology, and what makes your proposal competitive.
                            </small>
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={handleCancel}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Application'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ApplyJobModal;
