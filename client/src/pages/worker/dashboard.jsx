import React,{useState} from "react";
import { useAuth } from "../../context/AuthContext";
import Profile from "../common/profile"
import IssueList from "./IssueList"
import "../../styles/common/dashboard.css";

function WorkerDashboard() {

    const { logout } = useAuth();

    const [left_hide,set_left_hide] = useState(false);
    const [currentTab, setCurrentTab] = useState("Home");

    const RenderContent = () => {
        switch (currentTab) {
            // case "Home":
            //     return <Home />;
            case "Profile":
                return <Profile />;
            case "Issues":
                return <IssueList />;
            // case "Applications":
            //     return <Applications />;
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

                        <button
                            onClick={() => setCurrentTab("Applications")}
                            style={currentTab === "Applications" ? { backgroundColor: "#bcd6fbff" } : {}}
                        >
                            <i className="bx bx-check"> Total Applications</i>
                        </button>

                        <button
                            onClick={() => setCurrentTab("Issues")}
                            style={currentTab === "Issues" ? { backgroundColor: "#bcd6fbff" } : {}}
                        >
                            <i className="bx bx-time"> View Issues</i>
                        </button>

                        <button
                            onClick={() => setCurrentTab("Review Problems")}
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
                <div> {RenderContent()} </div>
            </div>
        </div>
	);
}

export default WorkerDashboard;