import React from 'react';
import { FaPencilAlt, FaHandshake, FaCheckCircle } from 'react-icons/fa';

const HowItWorks = () => (
    <section id="how-it-works" className="how-it-works">
        <div className="section-header">
            <h2>How It Works</h2>
            <p>A simple, transparent process for a better community.</p>
        </div>
        <div className="steps-grid">
            <div className="step-card">
                <div className="step-icon"><FaPencilAlt /></div>
                <h3>1. Report an Issue</h3>
                <p>Citizens easily report local problems with details and photos.</p>
            </div>
            <div className="step-card">
                <div className="step-icon"><FaHandshake /></div>
                <h3>2. Connect with Workers</h3>
                <p>Skilled local workers review issues and submit their proposals to fix them.</p>
            </div>
            <div className="step-card">
                <div className="step-icon"><FaCheckCircle /></div>
                <h3>3. Get It Solved</h3>
                <p>The issue is resolved, verified, and the worker gets paid. Everyone wins.</p>
            </div>
        </div>
    </section>
);

export default HowItWorks;
