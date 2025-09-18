import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AnimatedBackground from '../components/AnimatedBackground';
import Header from '../components/home/Header';
import Hero from '../components/home/Hero';
import HowItWorks from '../components/home/HowItWorks';
import Features from '../components/home/Features';
import UserRoles from '../components/home/UserRoles';
import FinalCTA from '../components/home/FinalCTA';
import Footer from '../components/home/Footer';
import '../styles/home.css';

const HomePage = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleGetStarted = () => {
        if (isAuthenticated()) {
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
        <AnimatedBackground>
            <div className="home-page">
                <Header isAuthenticated={isAuthenticated} handleDashboard={handleDashboard} handleLogout={handleLogout} />
                <Hero handleGetStarted={handleGetStarted} isAuthenticated={isAuthenticated} />
                <HowItWorks />
                <Features />
                <UserRoles />
                <FinalCTA handleGetStarted={handleGetStarted} isAuthenticated={isAuthenticated} />
                <Footer />
            </div>
        </AnimatedBackground>
    );
};

export default HomePage;
