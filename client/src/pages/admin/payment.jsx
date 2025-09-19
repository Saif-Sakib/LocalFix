import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AnimatedBackground from "../../components/AnimatedBackground";
import "../../styles/admin/payment.css";
import axios from "axios";

function AdminPayment() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    
    // Sample data - replace with actual API calls
    const [paymentData, setPaymentData] = useState({
        remainingBalance: 2750.50,
        currency: 'USD',
        workItems: [
            {
                id: 1,
                workDescription: "Road Pothole Repair - Main Street",
                workerName: "John Smith",
                completionDate: "2025-09-15",
                cost: 450.00,
                status: "Paid",
                issueId: "ISS-001"
            },
            {
                id: 2,
                workDescription: "Traffic Light Maintenance - Downtown",
                workerName: "Sarah Johnson", 
                completionDate: "2025-09-18",
                cost: 320.00,
                status: "Paid",
                issueId: "ISS-002"
            },
            {
                id: 3,
                workDescription: "Park Bench Replacement - Central Park",
                workerName: "Mike Wilson",
                completionDate: "2025-09-19",
                cost: 180.75,
                status: "Paid",
                issueId: "ISS-003"
            },
            {
                id: 4,
                workDescription: "Street Light Repair - Oak Avenue",
                workerName: "Emily Davis",
                completionDate: "2025-09-20",
                cost: 275.50,
                status: "Pending Payment",
                issueId: "ISS-004"
            },
            {
                id: 5,
                workDescription: "Sidewalk Crack Filling - Elm Street",
                workerName: "Robert Brown",
                completionDate: "2025-09-17",
                cost: 195.25,
                status: "Paid",
                issueId: "ISS-005"
            }
        ]
    });

    useEffect(() => {
        // Simulate loading time
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const handlePayNow = async () => {
        setPaymentProcessing(true);
        
        // Simulate payment processing
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Update payment status for all pending items
            setPaymentData(prev => ({
                ...prev,
                workItems: prev.workItems.map(item => ({
                    ...item,
                    status: item.status === "Pending Payment" ? "Paid" : item.status
                }))
            }));
            
            alert("Payment processed successfully!");
            setPaymentData(prev => ({
                ...prev,
                remainingBalance: prev.remainingBalance - getTotalAmount()
            }));
        } catch (error) {
            setError("Payment processing failed. Please try again.");
        } finally {
            setPaymentProcessing(false);
        }
    };

    const getTotalAmount = () => {
        return paymentData.workItems
            .filter(item => item.status === "Pending Payment")
            .reduce((total, item) => total + item.cost, 0);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: paymentData.currency
        }).format(amount);
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case "Pending Payment":
                return "status-pending";
            case "Paid":
                return "status-paid";
            default:
                return "status-default";
        }
    };

    if (authLoading || loading) {
        return (
            <div className="admin-payment">
                <AnimatedBackground />
                <div className="payment-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading payment information...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-payment">
                <AnimatedBackground />
                <div className="payment-error">
                    <h2>Error</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <AnimatedBackground >
            <div className="admin-payment">
                
                <div className="payment-header">
                    <h1>Payment Management</h1>
                    <p>Manage payments for completed work orders</p>
                </div>

                {/* Balance Overview */}
                <div className="balance-section">
                    <div className="balance-card">
                        <div className="balance-info">
                            <h2>Remaining Balance</h2>
                            <div className="balance-amount">
                                {formatCurrency(paymentData.remainingBalance)}
                            </div>
                            <p className="balance-note">Available for payments</p>
                        </div>
                        <div className="balance-icon">
                            <i className="fas fa-wallet"></i>
                        </div>
                    </div>
                    
                    <div className="payment-summary">
                        <div className="summary-item">
                            <span className="summary-label">Total Due:</span>
                            <span className="summary-value due">{formatCurrency(getTotalAmount())}</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Pending Items:</span>
                            <span className="summary-value">
                                {paymentData.workItems.filter(item => item.status === "Pending Payment").length}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Work Items List */}
                <div className="work-items-section">
                    <div className="section-header">
                        <h2>Work Orders & Payments</h2>
                        <div className="items-count">
                            {paymentData.workItems.length} total items
                        </div>
                    </div>

                    <div className="work-items-list">
                        {paymentData.workItems.map((item) => (
                            <div key={item.id} className="work-item-card">
                                <div className="item-header">
                                    <div className="item-title">
                                        <h3>{item.workDescription}</h3>
                                        <span className="issue-id">Issue: {item.issueId}</span>
                                    </div>
                                </div>
                                
                                <div className="item-details">
                                    <div className="detail-row">
                                        <span className="detail-label">Worker:</span>
                                        <span className="detail-value">{item.workerName}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Completed:</span>
                                        <span className="detail-value">
                                            {new Date(item.completionDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Cost:</span>
                                        <span className="detail-value cost">{formatCurrency(item.cost)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Status:</span>
                                        <span className={`detail-value status ${getStatusBadgeClass(item.status)}`}>{item.status}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Action */}
                {getTotalAmount() > 0 && (
                    <div className="payment-action-section">
                        <div className="payment-total">
                            <span className="total-label">Total Amount Due:</span>
                            <span className="total-amount">{formatCurrency(getTotalAmount())}</span>
                        </div>
                        
                        <button 
                            className={`pay-now-btn ${paymentProcessing ? 'processing' : ''}`}
                            onClick={handlePayNow}
                            disabled={paymentProcessing || getTotalAmount() === 0}
                        >
                            {paymentProcessing ? (
                                <>
                                    <div className="btn-spinner"></div>
                                    Processing Payment...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-credit-card"></i>
                                    Pay Now
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </AnimatedBackground>
    );
}

export default AdminPayment;