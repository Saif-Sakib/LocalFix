import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Profile from "../common/profile";
import IssueList from "../common/IssueList";
import MyApplications from "./myApplications";
import "../../styles/common/dashboard.css";

function WorkerDashboard() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [left_hide, set_left_hide] = useState(false);
    const [currentTab, setCurrentTab] = useState("Home");
    const [isMobile, setIsMobile] = useState(false);

    // Check if device is mobile and set initial state
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth <= 900;
            setIsMobile(mobile);

            // Hide left panel by default on mobile
            if (mobile) {
                set_left_hide(true);
            }
        };

        // Check on initial load
        checkMobile();

        // Add event listener for resize
        window.addEventListener('resize', checkMobile);

        // Cleanup
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Handle tab change - hide panel on mobile after selection
    const handleTabChange = (tab) => {
        setCurrentTab(tab);

        // Auto-hide panel on mobile after clicking any button
        if (isMobile) {
            set_left_hide(true);
        }
    };

    // Handle logo click - navigate to home
    const handleLogoClick = () => {
        navigate('/');
    };

    const RenderContent = () => {
        switch (currentTab) {
            case "Profile":
                return <Profile />;
            case "Issues":
                return <IssueList />;
            case "MyApplications":
                return <MyApplications />;
            default:
                return (
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        height: '60vh',
                        flexDirection: 'column',
                        gap: '20px'
                    }}>
                        <h2 style={{ 
                            color: '#64748b', 
                            fontSize: '28px', 
                            fontWeight: '600' 
                        }}>
                            Welcome to Worker Dashboard
                        </h2>
                        <p style={{ 
                            color: '#94a3b8', 
                            fontSize: '16px' 
                        }}>
                            Select an option from the sidebar to get started.
                        </p>
                    </div>
                );
        }
    };

    return (
        <div className="dashboard-container">
            {!left_hide && (
                <div className="left-panel">
                    <header>
                        <div onClick={handleLogoClick} className="logo">
                            <div className="logo-icon">
                                <span>🔧</span>
                            </div>
                            <span className="logo-text">LocalFix</span>
                        </div>
                        <button
                            onClick={() => set_left_hide(!left_hide)}
                            className="toggle-btn"
                        >
                            <i className="bx bx-x"></i>
                        </button>
                    </header>
                    <div className="left-button">
                        <button
                            onClick={() => handleTabChange("Home")}
                            style={currentTab === "Home" ? { backgroundColor: "#bcd6fbff" } : {}}
                        >
                            <i className="bx bx-home"></i>
                            <span>Home</span>
                        </button>

                        <button
                            onClick={() => handleTabChange("Profile")}
                            style={currentTab === "Profile" ? { backgroundColor: "#bcd6fbff" } : {}}
                        >
                            <i className="bx bx-user"></i>
                            <span>Profile</span>
                        </button>

                        <button
                            onClick={() => handleTabChange("Issues")}
                            style={currentTab === "Issues" ? { backgroundColor: "#bcd6fbff" } : {}}
                        >
                            <i className="bx bx-time"></i>
                            <span>View Issues</span>
                        </button>

                        <button
                            onClick={() => handleTabChange("MyApplications")}
                            style={currentTab === "MyApplications" ? { backgroundColor: "#bcd6fbff" } : {}}
                        >
                            <i className="bx bx-time"></i>
                            <span>My Appliations</span>
                        </button>
                    </div>
                </div>
            )}

            {left_hide && (
                <div className="left-hide">
                    <header>
                        <button onClick={() => set_left_hide(!left_hide)} className="toggle-btn">
                            <i className="bx bx-menu"></i>
                        </button>
                    </header>
                </div>
            )}

            <div
                className="right-panel"
                style={{ width: left_hide ? "100%" : "" }}
            >
                <header>
                    <button onClick={logout}>
                        <i className="bx bx-log-out"></i>
                        <span>Logout</span>
                    </button>
                </header>
                <div className="main-container">
                    {RenderContent()}
                </div>
            </div>
        </div>
    );
}

export default WorkerDashboard;