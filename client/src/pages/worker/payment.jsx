import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AnimatedBackground from '../../components/AnimatedBackground';
import { FaWallet, FaChartLine, FaDownload, FaCheck, FaCreditCard } from 'react-icons/fa';
import '../../styles/worker/payment.css';
import axios from 'axios';

function WorkerPayment() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [withdrawalProcessing, setWithdrawalProcessing] = useState(false);
    
    // Withdrawal form state
    const [withdrawalForm, setWithdrawalForm] = useState({
        method: 'bkash',
        accountNumber: '',
        amount: ''
    });

    // Sample payment data - replace with actual API calls
    const [paymentData, setPaymentData] = useState({
        currentBalance: 15750.50,
        totalEarnings: 45200.75,
        currency: 'BDT',
        recentIncomes: [
            {
                id: 1,
                description: "Road Pothole Repair - Main Street",
                amount: 1200.00,
                date: "2025-09-20",
                status: "Completed",
                issueId: "ISS-001"
            },
            {
                id: 2,
                description: "Traffic Light Maintenance - Downtown",
                amount: 850.00,
                date: "2025-09-18",
                status: "Completed",
                issueId: "ISS-002"
            },
            {
                id: 3,
                description: "Park Bench Replacement - Central Park",
                amount: 650.00,
                date: "2025-09-17",
                status: "Completed",
                issueId: "ISS-003"
            },
            {
                id: 4,
                description: "Street Light Repair - Oak Avenue",
                amount: 950.00,
                date: "2025-09-15",
                status: "Completed",
                issueId: "ISS-004"
            },
            {
                id: 5,
                description: "Sidewalk Crack Filling - Elm Street",
                amount: 450.75,
                date: "2025-09-14",
                status: "Completed",
                issueId: "ISS-005"
            }
        ],
        recentWithdrawals: [
            {
                id: 1,
                method: "bKash",
                accountNumber: "01712345678",
                amount: 5000.00,
                date: "2025-09-16",
                status: "Successful",
                transactionId: "TXN001"
            },
            {
                id: 2,
                method: "Rocket",
                accountNumber: "01798765432",
                amount: 3000.00,
                date: "2025-09-10",
                status: "Successful",
                transactionId: "TXN002"
            },
            {
                id: 3,
                method: "Nagad",
                accountNumber: "01534567890",
                amount: 2500.00,
                date: "2025-09-05",
                status: "Pending",
                transactionId: "TXN003"
            },
            {
                id: 4,
                method: "Sonali Bank",
                accountNumber: "1234567890123",
                amount: 10000.00,
                date: "2025-09-01",
                status: "Successful",
                transactionId: "TXN004"
            }
        ]
    });

    // Memoized payment methods to avoid recreation on each render
    const paymentMethods = useMemo(() => [
        { value: 'bkash', label: 'bKash', icon: '/bkash-logo.png' },
        { value: 'rocket', label: 'Rocket', icon: '/rocket-logo.png' },
        { value: 'nagad', label: 'Nagad', icon: '/nagad-logo.png' },
        { value: 'sonali_bank', label: 'Sonali Bank', icon: <FaCreditCard /> }
    ], []);

    useEffect(() => {
        // Simulate loading time - reduced from 1000ms to 500ms
        const timer = setTimeout(() => {
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    // Memoized input change handler to prevent recreation
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setWithdrawalForm(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    // Memoized withdraw handler
    const handleWithdraw = useCallback(async (e) => {
        e.preventDefault();
        setWithdrawalProcessing(true);
        
        try {
            // Validate form
            if (!withdrawalForm.accountNumber || !withdrawalForm.amount) {
                throw new Error("Please fill in all required fields");
            }
            
            const amount = parseFloat(withdrawalForm.amount);
            if (amount <= 0 || amount > paymentData.currentBalance) {
                throw new Error("Invalid withdrawal amount");
            }

            // Simulate withdrawal processing - reduced timeout
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Add new withdrawal to recent withdrawals
            const newWithdrawal = {
                id: Date.now(),
                method: paymentMethods.find(m => m.value === withdrawalForm.method)?.label,
                accountNumber: withdrawalForm.accountNumber,
                amount: amount,
                date: new Date().toISOString().split('T')[0],
                status: "Processing",
                transactionId: `TXN${Date.now()}`
            };

            setPaymentData(prev => ({
                ...prev,
                currentBalance: prev.currentBalance - amount,
                recentWithdrawals: [newWithdrawal, ...prev.recentWithdrawals.slice(0, 4)] // Keep only 5 items
            }));

            // Reset form
            setWithdrawalForm({
                method: 'bkash',
                accountNumber: '',
                amount: ''
            });

            alert("Withdrawal request submitted successfully!");
        } catch (error) {
            setError(error.message);
        } finally {
            setWithdrawalProcessing(false);
        }
    }, [withdrawalForm, paymentData.currentBalance, paymentMethods]);

    // Memoized currency formatter
    const formatCurrency = useCallback((amount) => {
        return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;
    }, []);

    // Memoized payment method icon function  
    const getPaymentMethodIcon = useCallback((method) => {
        const methodData = paymentMethods.find(m => 
            m.label.toLowerCase() === method.toLowerCase()
        );
        if (methodData) {
            return typeof methodData.icon === 'string' ? (
                <img src={methodData.icon} alt={methodData.label} style={{width: '20px', height: '20px'}} />
            ) : (
                methodData.icon
            );
        }
        return <FaCreditCard />;
    }, [paymentMethods]);

    if (authLoading || loading) {
        return (
            <div className="worker-payment">
                <div className="payment-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading payment information...</p>
                </div>
            </div>
        );
    }

    if (error && !withdrawalProcessing) {
        return (
            <div className="worker-payment">
                <div className="payment-error">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button onClick={() => setError('')} className="retry-btn">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <AnimatedBackground>
            <div className="worker-payment">
                <div className="payment-header">
                    <h1>Payment & Withdrawal</h1>
                    <p>Manage your earnings and withdraw funds</p>
                </div>

                {/* Balance Overview */}
                <div className="balance-overview">
                    <div className="balance-card current">
                        <div className="balance-info">
                            <h3>Current Balance</h3>
                            <div className="balance-amount">
                                {formatCurrency(paymentData.currentBalance)}
                            </div>
                            <p className="balance-note">Available for withdrawal</p>
                        </div>
                        <div className="balance-icon">
                            <FaWallet />
                        </div>
                    </div>

                    <div className="balance-card total">
                        <div className="balance-info">
                            <h3>Total Earnings</h3>
                            <div className="balance-amount">
                                {formatCurrency(paymentData.totalEarnings)}
                            </div>
                            <p className="balance-note">Lifetime earnings</p>
                        </div>
                        <div className="balance-icon">
                            <FaChartLine />
                        </div>
                    </div>
                </div>

                {/* Withdrawal Form */}
                <div className="withdrawal-section">
                    <div className="section-header">
                        <h2>Withdraw Funds</h2>
                        <p>Choose your preferred payment method</p>
                    </div>

                    <form onSubmit={handleWithdraw} className="withdrawal-form">
                        <div className="form-group">
                            <label>Payment Method</label>
                            <div className="payment-methods">
                                {paymentMethods.map((method) => (
                                    <label 
                                        key={method.value} 
                                        className={`payment-method ${withdrawalForm.method === method.value ? 'selected' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name="method"
                                            value={method.value}
                                            checked={withdrawalForm.method === method.value}
                                            onChange={handleInputChange}
                                        />
                                        <span className="method-icon">
                                            {typeof method.icon === 'string' ? (
                                                <img src={method.icon} alt={method.label} />
                                            ) : (
                                                method.icon
                                            )}
                                        </span>
                                        <span className="method-label">{method.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="accountNumber">
                                    {withdrawalForm.method === 'sonali_bank' ? 'Account Number' : 'Mobile Number'}
                                </label>
                                <input
                                    type="text"
                                    id="accountNumber"
                                    name="accountNumber"
                                    value={withdrawalForm.accountNumber}
                                    onChange={handleInputChange}
                                    placeholder={withdrawalForm.method === 'sonali_bank' ? '1234567890123' : '01712345678'}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="amount">Amount (BDT)</label>
                                <input
                                    type="number"
                                    id="amount"
                                    name="amount"
                                    value={withdrawalForm.amount}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                    min="1"
                                    max={paymentData.currentBalance}
                                    step="0.01"
                                    required
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className={`withdraw-btn ${withdrawalProcessing ? 'processing' : ''}`}
                            disabled={withdrawalProcessing}
                        >
                            {withdrawalProcessing ? (
                                <>
                                    <div className="btn-spinner"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <FaDownload /> Withdraw Funds
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Recent Transactions */}
                <div className="transactions-section">
                    <div className="transactions-grid">
                        {/* Recent Incomes */}
                        <div className="transaction-list">
                            <div className="list-header">
                                <h3>Recent Incomes</h3>
                                <span className="list-count">{paymentData.recentIncomes.length}</span>
                            </div>
                            <div className="transaction-items">
                                {paymentData.recentIncomes.slice(0, 5).map((income) => (
                                    <div key={income.id} className="transaction-item income">
                                        <div className="transaction-icon">
                                            <FaCheck />
                                        </div>
                                        <div className="transaction-details">
                                            <h4>{income.description}</h4>
                                            <p className="transaction-meta">
                                                {income.issueId} • {new Date(income.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="transaction-amount income">
                                            +{formatCurrency(income.amount)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Withdrawals */}
                        <div className="transaction-list">
                            <div className="list-header">
                                <h3>Recent Withdrawals</h3>
                                <span className="list-count">{paymentData.recentWithdrawals.length}</span>
                            </div>
                            <div className="transaction-items">
                                {paymentData.recentWithdrawals.slice(0, 5).map((withdrawal) => (
                                    <div key={withdrawal.id} className="transaction-item withdrawal">
                                        <div className="transaction-icon">
                                            {getPaymentMethodIcon(withdrawal.method)}
                                        </div>
                                        <div className="transaction-details">
                                            <h4>{withdrawal.method}</h4>
                                            <p className="transaction-meta">
                                                {withdrawal.accountNumber} • {new Date(withdrawal.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="transaction-amount withdrawal">
                                            -{formatCurrency(withdrawal.amount)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedBackground>
    );
}

export default WorkerPayment;