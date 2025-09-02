import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/home.css';

const HomePage = () => {
	const { isAuthenticated, user, logout } = useAuth();
	const navigate = useNavigate();

	const handleLogoClick = () => {
		navigate('/');
	};

	const handleGetStarted = () => {
		if (isAuthenticated()) {
			// Redirect to appropriate dashboard based on user type
			const userType = user?.user_type || user?.role;
			navigate(`/${userType}`);
		} else {
			navigate('/auth');
		}
	};

	const handleDashboard = () => {
		const userType = user?.user_type || user?.role;
		navigate(`/${userType}`);
	};

	const handleLogout = () => {
		logout();
		navigate('/');
	};

	return (
		<div className="home-container">
			{/* Header */}
			<header className="header">
				<div className="header-content">
					<div className="header-left">
						{/* Logo */}
						<div onClick={handleLogoClick} className="logo">
							<div className="logo-icon">
								<span>🔧</span>
							</div>
							<span className="logo-text">LocalFix</span>
						</div>
					</div>

					{/* Right side buttons */}
					<div className="header-right">
						{isAuthenticated() ? (
							<>
								<button onClick={handleDashboard} className="btn btn-primary">
									Dashboard
								</button>
								<button onClick={handleLogout} className="btn btn-secondary">
									Logout
								</button>
							</>
						) : (
							<button onClick={() => navigate('/auth')} className="btn btn-primary">
								Login / Sign Up
							</button>
						)}
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<section className="hero">
				<div className="hero-content">
					<div className="hero-emoji">🏘️</div>
					<h1 className="hero-title">
						Fix Your Community,<br />One Issue at a Time
					</h1>
					<p className="hero-description">
						Connect with skilled local workers to solve community problems. From broken streetlights to damaged roads,
						<span className="highlight"> LocalFix makes it easy</span> to report issues and get them resolved quickly.
					</p>
					<button onClick={handleGetStarted} className="btn btn-hero">
						{isAuthenticated() ? 'Go to Dashboard' : 'Get Started Today'}
						<span className="btn-arrow">→</span>
					</button>
				</div>
			</section>

			{/* How It Works Section */}
			<section className="how-it-works">
				<div className="container">
					<div className="section-header">
						<h2>How LocalFix Works</h2>
						<p>A simple 3-step process that connects communities with solutions</p>
					</div>

					<div className="steps-grid">
						{/* Step 1 */}
						<div className="step-card step-blue">
							<div className="step-icon">📋</div>
							<h3>1. Report Issues</h3>
							<p>
								Citizens easily report local problems with photos, descriptions, and exact locations.
								From potholes to broken streetlights, every issue matters.
							</p>
						</div>

						{/* Step 2 */}
						<div className="step-card step-purple">
							<div className="step-icon">⚒️</div>
							<h3>2. Workers Apply</h3>
							<p>
								Skilled local workers browse available jobs and submit applications with
								cost estimates and timelines. Competition ensures fair pricing.
							</p>
						</div>

						{/* Step 3 */}
						<div className="step-card step-green">
							<div className="step-icon">✅</div>
							<h3>3. Get It Fixed</h3>
							<p>
								Admins review applications, select the best worker, and monitor progress.
								Payment is secure and released upon verified completion.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="features">
				<div className="container">
					<div className="section-header">
						<h2>Why Choose LocalFix?</h2>
						<p>Built for communities, by communities</p>
					</div>

					<div className="features-grid">
						<div className="feature-card">
							<div className="feature-icon feature-blue">🎯</div>
							<h3>Local Focus</h3>
							<p>Connecting neighbors with nearby skilled workers for faster, more personal service.</p>
						</div>

						<div className="feature-card">
							<div className="feature-icon feature-green">🔒</div>
							<h3>Secure Payments</h3>
							<p>Safe, verified transactions with payment released only after job completion.</p>
						</div>

						<div className="feature-card">
							<div className="feature-icon feature-purple">⭐</div>
							<h3>Quality Assured</h3>
							<p>Rating system and admin oversight ensure high-quality work and reliable service.</p>
						</div>

						<div className="feature-card">
							<div className="feature-icon feature-orange">📱</div>
							<h3>Easy to Use</h3>
							<p>Intuitive interface makes reporting issues and finding work simple for everyone.</p>
						</div>
					</div>
				</div>
			</section>

			{/* User Types Section */}
			<section className="user-types">
				<div className="container">
					<div className="section-header">
						<h2>Who Can Use LocalFix?</h2>
						<p>Our platform serves everyone in the community</p>
					</div>

					<div className="user-types-grid">
						{/* Citizens */}
						<div className="user-type-card user-citizen">
							<div className="user-type-bg"></div>
							<div className="user-type-content">
								<div className="user-type-emoji">👥</div>
								<h3>Citizens</h3>
								<ul>
									<li>• Report community issues</li>
									<li>• Track repair progress</li>
									<li>• Rate worker performance</li>
									<li>• Build better neighborhoods</li>
								</ul>
							</div>
						</div>

						{/* Workers */}
						<div className="user-type-card user-worker">
							<div className="user-type-bg"></div>
							<div className="user-type-content">
								<div className="user-type-emoji">🔨</div>
								<h3>Workers</h3>
								<ul>
									<li>• Find local repair jobs</li>
									<li>• Set your own rates</li>
									<li>• Build your reputation</li>
									<li>• Grow your business</li>
								</ul>
							</div>
						</div>

						{/* Admins */}
						<div className="user-type-card user-admin">
							<div className="user-type-bg"></div>
							<div className="user-type-content">
								<div className="user-type-emoji">👨‍💼</div>
								<h3>Admins</h3>
								<ul>
									<li>• Oversee job quality</li>
									<li>• Review applications</li>
									<li>• Verify completions</li>
									<li>• Ensure platform integrity</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Problem Categories */}
			<section className="categories">
				<div className="container">
					<div className="section-header">
						<h2>What We Fix</h2>
						<p>From infrastructure to utilities, we handle all types of community issues</p>
					</div>

					<div className="categories-grid">
						<div className="category-card category-red">
							<div className="category-icon">🛣️</div>
							<p>Roads & Infrastructure</p>
						</div>
						<div className="category-card category-yellow">
							<div className="category-icon">💡</div>
							<p>Street Lights</p>
						</div>
						<div className="category-card category-blue">
							<div className="category-icon">💧</div>
							<p>Water & Sanitation</p>
						</div>
						<div className="category-card category-green">
							<div className="category-icon">🗑️</div>
							<p>Waste Management</p>
						</div>
						<div className="category-card category-purple">
							<div className="category-icon">🚨</div>
							<p>Public Safety</p>
						</div>
						<div className="category-card category-gray">
							<div className="category-icon">🔧</div>
							<p>General Repairs</p>
						</div>
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className="stats">
				<div className="container">
					<div className="section-header stats-header">
						<h2>Making a Real Impact</h2>
						<p>Join thousands of community members already using LocalFix</p>
					</div>

					<div className="stats-grid">
						<div className="stat-item">
							<div className="stat-number">1,000+</div>
							<p>Issues Resolved</p>
						</div>
						<div className="stat-item">
							<div className="stat-number">500+</div>
							<p>Active Workers</p>
						</div>
						<div className="stat-item">
							<div className="stat-number">50+</div>
							<p>Communities Served</p>
						</div>
						<div className="stat-item">
							<div className="stat-number">4.8★</div>
							<p>Average Rating</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="cta">
				<div className="container">
					<div className="cta-card">
						<h2>Ready to Transform Your Community?</h2>
						<p>
							Whether you're reporting an issue or looking for work, LocalFix makes community improvement simple and rewarding.
						</p>
						<div className="cta-buttons">
							<button onClick={handleGetStarted} className="btn btn-hero">
								{isAuthenticated() ? 'Go to Dashboard' : 'Join LocalFix Today'}
								<span className="btn-arrow">→</span>
							</button>
							{!isAuthenticated() && (
								<button onClick={() => navigate('/auth')} className="btn btn-outline">
									Learn More
								</button>
							)}
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="footer">
				<div className="container">
					<div className="footer-content">
						<div className="footer-brand">
							<div className="footer-logo">
								<div className="footer-logo-icon">🔧</div>
								<span className="footer-logo-text">LocalFix</span>
							</div>
							<p className="footer-description">
								Empowering communities to solve local problems together.
								Building stronger neighborhoods, one fix at a time.
							</p>
						</div>

						<div className="footer-section">
							<h4>Platform</h4>
							<ul>
								<li>Report Issues</li>
								<li>Find Work</li>
								<li>Track Progress</li>
								<li>Community Impact</li>
							</ul>
						</div>

						<div className="footer-section">
							<h4>Support</h4>
							<ul>
								<li>Help Center</li>
								<li>Contact Us</li>
								<li>Safety Guidelines</li>
								<li>Community Rules</li>
							</ul>
						</div>
					</div>

					<div className="footer-bottom">
						<p>&copy; 2025 LocalFix. Built for stronger communities.</p>
					</div>
				</div>
			</footer>
		</div>
	);
};

export default HomePage;