import React from 'react';

const FinalCTA = ({ handleGetStarted, isAuthenticated }) => (
    <section className="final-cta">
        <h2>Ready to Make a Difference?</h2>
        <p>Join the movement to build stronger, more responsive communities.</p>
        <button onClick={handleGetStarted} className="btn btn-hero">
            {isAuthenticated() ? 'Back to Dashboard' : 'Get Started Now'}
        </button>
    </section>
);

export default FinalCTA;
