import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import Profile from "../common/profile";
import PostIssue from "./postIssue";
import MyJobs from "./myJobs";
import IssueList from "../common/IssueList";
import CitizenHome from "./home";
import "../../styles/common/dashboard.css";

function CitizenDashboard() {
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
            'post-issue': 'Post Issue',
            'view-issues': 'View Issues',
            'my-jobs': 'My Jobs',
            'home': 'Home'
        };

        if (tab && tabMapping[tab]) {
            setCurrentTab(tabMapping[tab]);
        } else {
            // If no tab parameter or invalid tab, default to Home and update URL
            setCurrentTab('Home');
            navigate('/citizen?tab=home', { replace: true });
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
            'Post Issue': 'post-issue',
            'View Issues': 'view-issues',
            'My Jobs': 'my-jobs',
            'Home': 'home'
        };

        const urlTab = tabUrlMapping[tab] || 'home';
        navigate(`/citizen?tab=${urlTab}`, { replace: true });

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
            case "Home":
                return <CitizenHome />;
            case "Profile":
                return <Profile />;
            case "Post Issue":
                return <PostIssue />;
            case "View Issues":
                return <IssueList />;
            case "My Jobs":
                return <MyJobs />;
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
                            onClick={() => handleTabChange("Post Issue")}
                            style={currentTab === "Post Issue" ? { backgroundColor: "#bcd6fbff" } : {}}
                        >
                            <i className="bx bx-time"></i>
                            <span>Post Issue</span>
                        </button>

                        <button
                            onClick={() => handleTabChange("My Jobs")}
                            style={currentTab === "My Jobs" ? { backgroundColor: "#bcd6fbff" } : {}}
                        >
                            <i className="bx bx-time"></i>
                            <span>My Posts</span>
                        </button>

                        <button
                            onClick={() => handleTabChange("View Issues")}
                            style={currentTab === "View Issues" ? { backgroundColor: "#bcd6fbff" } : {}}
                        >
                            <i className="bx bx-briefcase"></i>
                            <span>View Issues</span>
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

export default CitizenDashboard;