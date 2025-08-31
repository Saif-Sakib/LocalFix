import React,{ useState} from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { PieChart, Pie , Cell } from "recharts";
import "./home.css"

function Home() {
  
    const [month, set_month] = useState([]);
    const [work,set_work] = useState([]);
    const [category,set_category] = useState([]);

    const COLORS = ["#0088FE", "#00C49F", "#9b0ef3ff", "#FF8042", "#a2ac49ff"];

    const check_month = () => {
        // code to get the assigned and solved number of last 6 months
        set_month([
            { name: "Jan", Assigned: 10, Solved: 6 },
            { name: "Feb", Assigned: 12, Solved: 8 },
            { name: "Mar", Assigned: 15, Solved: 10 },
            { name: "Apr", Assigned: 20, Solved: 15 },
            { name: "May", Assigned: 25, Solved: 20 },
            { name: "Jun", Assigned: 30, Solved: 25 }
        ]);
    }

    const check_work = () => {
        // code to get the current status of tickets
        set_work([
            { name: "Assigned", value: 10 },
            { name: "Solved", value: 6 },
            { name: "Pending", value: 4 },
            { name: "Added Today", value: 2 },
            { name: "Solved Today", value: 1 }
        ]);
    }

    const check_category = () => {
        set_category([
            { name: "Road", value: 10 },
            { name: "Garbage", value: 6 },
            { name: "Water", value: 4 },
            { name: "Electricity", value: 2 }
        ]);
    }

    const [citizen,set_citizen] = useState(100);
    const [worker,set_worker] = useState(50);
    const [total_open_issue,set_total_open_issue] = useState(5);
    const [pending_issues,set_pending_issues] = useState(2);

    const check_citizen = () => {
        // code to get the total number of citizen
        set_citizen(citizen+10); // Example update
    }

    const check_worker = () => {
        // code to get the total number of worker
        set_worker(worker+10); // Example update
    }

    const check_total_issue = () => {
        // code to get the total open issues
        set_total_open_issue(total_open_issue+1);
    }

    const check_pending_work = () => {
        // code to get the pending work
        set_pending_issues(pending_issues+1);
    }

    const check_info = () => {
        check_month();
        check_work();
        check_category();
        check_citizen();
        check_worker();
        check_total_issue();
        check_pending_work();
    }

    React.useEffect(() => {
        console.log("Fetching data...");
        check_info();
    }, []);

    return (
        <div className="home-container">
            <div className="head-data">
                
                <div className="one-part">
                    <div className="data-set">
                        <div className="data">
                            <h3>
                                <i class='bx  bx-user' /> Total User
                            </h3>
                            <p>{citizen}</p>
                        </div>

                        <div className="data">
                            <h3>
                                <i class='bx  bx-user' /> Total Worker
                            </h3>
                            <p>{worker}</p>
                        </div>
                    </div>

                    <div className="data-set">
                        <div className="data">
                            <h3>
                                ⚠️ Total Open Issues
                            </h3>
                            <p>{total_open_issue}</p>
                        </div>

                        <div className="data">
                            <h3>
                                🕓 Pending Issues
                            </h3>
                            <p>{pending_issues}</p>
                        </div>
                    </div>
                </div>

                <div className="chart-card">
                    <h4 className="graph-title">Category Based Analysis</h4>
                    <PieChart width={350} height={250}>
                        <Pie
                            data={category}
                            cx="50%"
                            cy="50%"
                            outerRadius={70}
                            dataKey="value"
                            label
                        >
                            {category.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </div>
            </div>
            
            <div className="graph">
                <div className="chart-card" style={{width: "40%"}}>
                    <h4 className="graph-title">Previous Months Analysis</h4>
                    <BarChart width={350} height={250} data={month}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Assigned" fill="#8884d8" />
                        <Bar dataKey="Solved" fill="#82ca9d" />
                    </BarChart>
                </div>

                <div className="chart-card">
                    <h4 className="graph-title">Current Month Analysis</h4>
                    <PieChart width={350} height={250}>
                        <Pie
                            data={work}
                            cx="50%"
                            cy="50%"
                            outerRadius={70}
                            dataKey="value"
                            label
                        >
                            {work.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </div>
            </div>
        </div>
    );
}

export default Home;