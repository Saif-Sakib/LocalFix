import React,{ useState} from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { PieChart, Pie , Cell } from "recharts";
import { LineChart, Line, ResponsiveContainer} from "recharts";
import "../../styles/admin/home.css"

function Home() {
  
    const [month, set_month] = useState([]);
    const [category,set_category] = useState([]);
    const [average,set_average] = useState([]);
    const [citizen,set_citizen] = useState(100);
    const [worker,set_worker] = useState(50);
    const [total_open_issue,set_total_open_issue] = useState(5);
    const [pending_issues,set_pending_issues] = useState(2);

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

    const check_average = () => {
        // code to get the average solved and added per day for last 7 days
        set_average([
            { date: "2025-08-30", avgResolution: 5.2, avgAdded: 7.1 },
            { date: "2025-08-31", avgResolution: 3.8, avgAdded: 6.4 },
            { date: "2025-09-01", avgResolution: 4.5, avgAdded: 5.9 },
            { date: "2025-09-02", avgResolution: 2.9, avgAdded: 4.8 },
            { date: "2025-09-03", avgResolution: 6.1, avgAdded: 8.2 },
            { date: "2025-09-04", avgResolution: 4.0, avgAdded: 6.7 },
            { date: "2025-09-05", avgResolution: 3.4, avgAdded: 5.1 }
        ]);
    }

    const check_category = () => {
        // code to get the category wise issue count
        set_category([
            { name: "Road", value: 10 },
            { name: "Garbage", value: 6 },
            { name: "Water", value: 4 },
            { name: "Electricity", value: 2 }
        ]);
    }

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
        check_average();
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

    
    function formatDateTicks(ticks, index, allTicks) {
        const date = new Date(ticks);
        const day = date.getDate();
        const month = date.toLocaleString("default", { month: "short" });
        const year = date.getFullYear();

        // First tick always shows full (Day Mon)
        if (index === 0) return `${day} ${month}`;

        const prevDate = new Date(allTicks[index - 1]);

        // Same month & year → show only day
        if (
            date.getMonth() === prevDate.getMonth() &&
            date.getFullYear() === prevDate.getFullYear()
        ) {
            return `${day}`;
        }

        // Same year but different month → show month
        if (date.getFullYear() === prevDate.getFullYear()) {
            return `${month}`;
        }

        // Different year → show year
        return `${year}`;
    }

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
                                <i class='bx bx-error' /> Total Open Issues
                            </h3>
                            <p>{total_open_issue}</p>
                        </div>

                        <div className="data">
                            <h3>
                                <i class='bx bx-time' /> Pending Issues
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

                <div className="chart-card" style={{width: "40%"}}>
                    <h4 className="graph-title">Average Solved vs Added per Day</h4>
                    <ResponsiveContainer width={350} height={250}>
                        <LineChart data={average}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(tick, index) =>
                                formatDateTicks(tick, index, average.map((d) => d.date))
                                }
                            />
                            <YAxis />
                            <Tooltip />
                            <Legend />

                            <Line
                                type="monotone"
                                dataKey="avgResolution"
                                stroke="#8884d8"
                                strokeWidth={2}
                                activeDot={{ r: 6 }}
                                name="Avg Solved"
                            />

                            <Line
                                type="monotone"
                                dataKey="avgAdded"
                                stroke="#82ca9d"
                                strokeWidth={2}
                                activeDot={{ r: 6 }}
                                name="Avg Added"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

            </div>
        </div>
    );
}

export default Home;