import React,{ useState } from "react";
import "../../styles/common/issue.css";

function Issue() {
	const [status, set_status] = useState("");
	const [category, set_category] = useState("");
	const [priority, set_priority] = useState("");
	const [categories, set_categories] = useState([
		"Infrastructure",
		"Public Safety",
		"Environment",
		"Transportation",
		"Utilities",
		"Public Health",
		"Education",
		"Housing",
		"Parks & Recreation",
		"Other"
	]);
	const [issues, set_issues] = useState([
		{
			id: "#101",
			title: "Broken Streetlight",
			category: "Utilities",
			location: "Mirpur, Dhaka",
			status: "Pending",
			priority: "Medium",
			reportedOn: "29 Aug 2025",
		},
		{
			id: "#102",
			title: "Garbage Overflow",
			category: "Environment",
			location: "Uttara, Dhaka",
			status: "Resolved",
			priority: "High",
			reportedOn: "25 Aug 2025",
		},
		{
			id: "#103",
			title: "Pothole on Road",
			category: "Transportation",
			location: "Dhanmondi, Dhaka",
			status: "Rejected",
			priority: "Low",
			reportedOn: "28 Aug 2025",
		},
		{
			id: "#104",
			title: "Water Leakage",
			category: "Infrastructure",
			location: "Banani, Dhaka",
			status: "Critical",
			priority: "Critical",
			reportedOn: "30 Aug 2025",
		}
	]);

	const filteredIssues = issues.filter((issue) => {
		return (
			(status ? issue.status === status : true) &&
			(category ? issue.category === category : true) &&
			(priority ? issue.priority === priority : true)
		);
	});

	const check_info = () => {
	    // code to get the issues from database
	    set_issues(issues);
	    set_categories(categories);
	}
	React.useEffect(() => {
	    check_info();
	}, []);

	return (

		<div className="view-issue-container">
			<h2 className="title">View Issue</h2>

			<div className="filters">
				<select value={status} onChange={(e) => set_status(e.target.value)}>
					<option value="">Status</option>
					<option value="Pending">Pending</option>
					<option value="Resolved">Resolved</option>
					<option value="Rejected">Rejected</option>
					<option value="Critical">Critical</option>
				</select>

				<select value={category} onChange={(e) => set_category(e.target.value)}>
					<option value="">Category</option>
					{categories.map((cat, idx) => (
					<option key={idx} value={cat}>
						{cat}
					</option>
					))}
				</select>

				<select value={priority} onChange={(e) => set_priority(e.target.value)}>
					<option value="">Priority</option>
					<option value="Low">Low</option>
					<option value="Medium">Medium</option>
					<option value="High">High</option>
					<option value="Critical">Critical</option>
				</select>
			</div>

			<div className="table-wrapper">
				<table className="issue-table">
					<thead>
						<tr>
							<th>Issue ID</th>
							<th>Title</th>
							<th>Category</th>
							<th>Location</th>
							<th>Status</th>
							<th>Priority</th>
							<th>Reported On</th>
							<th>Actions</th>
						</tr>
					</thead>

					<tbody>
						{filteredIssues.length > 0 ? (
						filteredIssues.map((issue, index) => (
							<tr key={index}>
							<td>{issue.id}</td>
							<td>{issue.title}</td>
							<td>{issue.category}</td>
							<td>{issue.location}</td>
							<td>{issue.status}</td>
							<td>{issue.priority}</td>
							<td>{issue.reportedOn}</td>
							<td>
								<button className="view-btn">View</button>
							</td>
							</tr>
						))
						) : (
						<tr>
							<td colSpan="8" className="no-data"> No issues found </td>
						</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default Issue;
