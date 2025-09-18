import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ isAuthenticated, handleDashboard, handleLogout }) => {
    const navigate = useNavigate();

    return (
        <header className="header">
            <div className="header-container">
                <button onClick={() => navigate('/')} className="logo" aria-label="LocalFix home">
                    <div className="logo-icon">
                        <span>🔧</span>
                    </div>
                    <span className="logo-text">LocalFix</span>
                </button>

                <nav className="header-nav">
                    {isAuthenticated() ? (
                        <>
                            <button onClick={handleDashboard} className="btn btn-primary">
                                Dashboard
                            </button>
                            <button onClick={handleLogout} className="btn btn-ghost">
                                Logout
                            </button>
                        </>
                    ) : (
                        <button onClick={() => navigate('/auth')} className="btn btn-primary">
                            Login / Sign Up
                        </button>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
