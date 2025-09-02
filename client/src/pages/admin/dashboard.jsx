import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Home from "./home";
import Applications from "./total_applications";
import ReviewProblems from "./review_problem";
import IssueList from "../common/IssueList";
import Profile from "../common/profile"
import "../../styles/common/dashboard.css";

function AdminDashboard() {
    const { logout } = useAuth();
    
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

    const RenderContent = () => {
        switch (currentTab) {
            case "Home":
                return <Home />;
            case "Profile":
                return <Profile />;
            case "Issues":
                return <IssueList />;
            case "Applications":
                return <Applications />;
            case "Review Problems":
                return <ReviewProblems />;
            default:
                return null;
        }
    }

    return (
        <div className="dashboard-container">
            {!left_hide && (
                <div className="left-panel">
                    <header>
                        <button
                            onClick={() => set_left_hide(!left_hide)}
                            className="toggle-btn"
                        >
                            <i className="bx bx-menu"></i>
                        </button>
                    </header>
                    <div className="left-button">
                        <button
                            onClick={() => handleTabChange("Home")}
                            style={currentTab === "Home" ? { backgroundColor: "#bcd6fbff" } : {}}
                        >
                            <i className="bx bx-home"> Home</i>
                        </button>

                        <button
                            onClick={() => handleTabChange("Profile")}
                            style={currentTab === "Profile" ? { backgroundColor: "#bcd6fbff" } : {}}
                        >
                            <i className="bx bx-user"> Profile</i>
                        </button>

                        <button
                            onClick={() => handleTabChange("Applications")}
                            style={currentTab === "Applications" ? { backgroundColor: "#bcd6fbff" } : {}}
                        >
                            <i className="bx bx-check"> Total Applications</i>
                        </button>

                        <button
                            onClick={() => handleTabChange("Issues")}
                            style={currentTab === "Issues" ? { backgroundColor: "#bcd6fbff" } : {}}
                        >
                            <i className="bx bx-time"> View Issues</i>
                        </button>

                        <button
                            onClick={() => handleTabChange("Review Problems")}
                            style={currentTab === "Review Problems" ? { backgroundColor: "#bcd6fbff" } : {}}
                        >
                            <i className="bx bx-briefcase"> Review Problems</i>
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
                        <i className="bx bx-log-out"> Logout</i>
                    </button>
                </header>
                <div className="main-container">
                    {RenderContent()}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;