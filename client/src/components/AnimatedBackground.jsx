import React from 'react';
import './AnimatedBackground.css';

const AnimatedBackground = ({ children, className = "" }) => {
    return (
        <div className={`animated-page-container ${className}`}>
            {/* Animated Background Elements */}
            <div className="background-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
                <div className="shape shape-4"></div>
                <div className="shape shape-5"></div>
            </div>

            {/* Floating Particles */}
            <div className="floating-particles">
                <div className="particle particle-1"></div>
                <div className="particle particle-2"></div>
                <div className="particle particle-3"></div>
                <div className="particle particle-4"></div>
                <div className="particle particle-5"></div>
                <div className="particle particle-6"></div>
                <div className="particle particle-7"></div>
                <div className="particle particle-8"></div>
            </div>

            {/* Sparkle Effects */}
            <div className="sparkles">
                <div className="sparkle sparkle-1">✨</div>
                <div className="sparkle sparkle-2">⭐</div>
                <div className="sparkle sparkle-3">💫</div>
                <div className="sparkle sparkle-4">✨</div>
                <div className="sparkle sparkle-5">⭐</div>
                <div className="sparkle sparkle-6">💫</div>
                <div className="sparkle sparkle-7">✨</div>
                <div className="sparkle sparkle-8">⭐</div>
            </div>

            {/* Content */}
            <div className="page-content">
                {children}
            </div>
        </div>
    );
};

export default AnimatedBackground;