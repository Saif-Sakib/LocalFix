import React, { useEffect, useState } from "react";
//import "../../styles/CitizenIssue.css";
import axios from "axios";

function IssueList() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchIssues() {
      try {
        const res = await axios.get("http://localhost:5000/api/issues"); 
        setIssues(res.data.issues);  // ✅ now matches backend
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchIssues();
  }, []);

  if (loading) return <p>Loading issues...</p>;

  return (
    <div className="issue-page">
      <h2>All Reported Issues</h2>
      <div className="issues-grid">
  {issues.map(issue => (
    <div className="issue-card" key={issue.ID}>
      <h3>{issue.TITLE}</h3>
      <p><strong>Job Id:</strong> {issue.ID}</p>
      <p><strong>Location:</strong> {issue.LOCATION}</p>
      <p><strong>Category:</strong> {issue.CATEGORY}</p>
      <p><strong>Priority:</strong> {issue.PRIORITY}</p>
      <p><strong>Created At:</strong> {new Date(issue.CREATED_AT).toLocaleString()}</p>
      <button>View Details</button>
    </div>
  ))}
</div>

    </div>
  );
}

export default IssueList;
