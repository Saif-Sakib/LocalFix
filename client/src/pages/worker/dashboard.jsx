import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import Profile from "../common/profile";
import IssueList from "../common/IssueList";
import MyApplications from "./myApplications/myApplications";
import WorkerHome from "./home";
import "../../styles/common/dashboard.css";

function WorkerDashboard() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [left_hide, set_left_hide] = useState(false);
    const [currentTab, setCurrentTab] = useState("Home");
    const [isMobile, setIsMobile] = useState(false);

    // Handle URL parameters for tab navigation
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const tab = urlParams.get('tab');
        
        const tabMapping = {
            'profile': 'Profile',
            'issues': 'Issues',
            'my-applications': 'MyApplications',
            'home': 'Home'
        };

        if (tab && tabMapping[tab]) {
            setCurrentTab(tabMapping[tab]);
        } else {
            // If no tab parameter or invalid tab, default to Home and update URL
            setCurrentTab('Home');
            navigate('/worker?tab=home', { replace: true });
        }
    }, [location.search, navigate]);

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

        // Update URL to reflect the current tab
        const tabUrlMapping = {
            'Profile': 'profile',
            'Issues': 'issues',
            'MyApplications': 'my-applications',
            'Home': 'home'
        };

        const urlTab = tabUrlMapping[tab] || 'home';
        navigate(`/worker?tab=${urlTab}`, { replace: true });

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
                return <WorkerHome />;
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
                            <span>View Jobs</span>
                        </button>

                        <button
                            onClick={() => handleTabChange("MyApplications")}
                            style={currentTab === "MyApplications" ? { backgroundColor: "#bcd6fbff" } : {}}
                        >
                            <i className="bx bx-time"></i>
                            <span>My Applications</span>
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