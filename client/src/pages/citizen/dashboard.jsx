import React,{useState,useEffect} from "react";
import { useAuth } from "../../context/AuthContext";
import Profile from "../common/profile"
import CitizenIssue from "./CitizenIssue"
import IssueList from "../common/IssueList";
import "../../styles/common/dashboard.css";

function CitizenDashboard() {

    const { logout } = useAuth();

    const [left_hide,set_left_hide] = useState(false);
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
            // case "Home":
            //     return <Home />;
            case "Profile":
                return <Profile />;
            case "Issues":
                return <CitizenIssue />;
            case "View Issue":
                return <IssueList />;
            // case "Review Problems":
            //     return <ReviewProblems />;
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
                        {/* <a href="#">LocalFix</a> */}
                    </header>
                    <div className="left-button">
                        <button
                            onClick={() => setCurrentTab("Home")}
                            style={currentTab === "Home" ? { backgroundColor: "#bcd6fbff" } : {}}
                        >
                            <i className="bx bx-home"> Home</i>
                        </button>

                        <button
                            onClick={() => setCurrentTab("Profile")}
                            style={currentTab === "Profile" ? { backgroundColor: "#bcd6fbff" } : {}}
                        >
                            <i className="bx bx-user"> Profile</i>
                        </button>

                        {/* <button
                            onClick={() => setCurrentTab("Applications")}
                            style={currentTab === "Applications" ? { backgroundColor: "#bcd6fbff" } : {}}
                        >
                            <i className="bx bx-check"> Total Applications</i>
                        </button> */}

                        <button
                            onClick={() => setCurrentTab("Issues")}
                            style={currentTab === "Issues" ? { backgroundColor: "#bcd6fbff" } : {}}
                        >
                            <i className="bx bx-time"> Add Issue</i>
                        </button>

                        <button
                            onClick={() => setCurrentTab("View Issue")}
                            style={currentTab === "View Issue" ? { backgroundColor: "#bcd6fbff" } : {}}
                        >
                            <i className="bx bx-briefcase"> View Issue</i>
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

export default CitizenDashboard;