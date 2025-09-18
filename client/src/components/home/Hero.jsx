import React from 'react';

const Hero = ({ handleGetStarted, isAuthenticated }) => (
    <main className="hero-container">
        <div className="hero-content">
            <h1 className="hero-title">
                Build a Better Community, Together.
            </h1>
            <p className="hero-description">
                LocalFix connects citizens with skilled workers to resolve local issues quickly and efficiently. Report a problem, find a solution, and see your community thrive.
            </p>
            <button onClick={handleGetStarted} className="btn btn-hero">
                {isAuthenticated() ? 'Go to Your Dashboard' : 'Join Now & Make a Difference'}
            </button>
        </div>
    </main>
);

export default Hero;
