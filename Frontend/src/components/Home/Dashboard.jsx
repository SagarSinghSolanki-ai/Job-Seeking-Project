import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Context } from "../../main";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from "recharts";
import { Briefcase, FileText, CheckCircle } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const { isAuthorized, user } = useContext(Context);
  const navigateTo = useNavigate();

  useEffect(() => {
    if (!isAuthorized || (user && user.role === "Job Seeker")) {
      navigateTo("/");
    }
  }, [isAuthorized, user, navigateTo]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4000/api/v1/analytics/employer",
          { withCredentials: true }
        );
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      }
    };

    if (isAuthorized && user?.role === "Employer") {
      fetchAnalytics();
    }
  }, [isAuthorized, user]);

  if (!stats) {
    return (
      <div className="page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <h3 style={{ color: "var(--text)" }}>Loading dashboard statistics...</h3>
      </div>
    );
  }

  const { counters, statusBreakdown, categoryDistribution, monthlyTrend } = stats;

  const statusData = Object.keys(statusBreakdown).map((key) => ({
    name: key,
    value: statusBreakdown[key]
  })).filter(item => item.value > 0);

  const COLORS = ["#f59e0b", "#17a2b8", "#fd7e14", "#ef4444", "#10b981"];

  return (
    <section className="dashboard page">
      <div className="container">
        <div className="page-header">
          <span className="section-label">Recruiter Insights</span>
          <h1>Employer Dashboard</h1>
          <p>Real-time analytics and statistics for your active recruitment campaigns.</p>
        </div>

        {/* Stats Cards Grid */}
        <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "40px" }}>
          <div className="stat-card" style={{ display: "flex", alignItems: "center", padding: "20px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", boxShadow: "var(--shadow)" }}>
            <div style={{ padding: "12px", background: "#e0f2fe", borderRadius: "8px", marginRight: "16px", color: "#0284c7" }}>
              <Briefcase size={28} />
            </div>
            <div>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>Total Jobs Posted</p>
              <h2 style={{ fontSize: "28px", color: "var(--text)", fontWeight: 700 }}>{counters.totalJobs}</h2>
            </div>
          </div>

          <div className="stat-card" style={{ display: "flex", alignItems: "center", padding: "20px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", boxShadow: "var(--shadow)" }}>
            <div style={{ padding: "12px", background: "#d1fae5", borderRadius: "8px", marginRight: "16px", color: "#059669" }}>
              <CheckCircle size={28} />
            </div>
            <div>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>Active Listings</p>
              <h2 style={{ fontSize: "28px", color: "var(--text)", fontWeight: 700 }}>{counters.activeJobs}</h2>
            </div>
          </div>

          <div className="stat-card" style={{ display: "flex", alignItems: "center", padding: "20px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", boxShadow: "var(--shadow)" }}>
            <div style={{ padding: "12px", background: "#fef3c7", borderRadius: "8px", marginRight: "16px", color: "#d97706" }}>
              <FileText size={28} />
            </div>
            <div>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>Total Applications</p>
              <h2 style={{ fontSize: "28px", color: "var(--text)", fontWeight: 700 }}>{counters.totalApplications}</h2>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "30px", marginBottom: "40px" }}>
          
          {/* Monthly Trend Chart */}
          <div style={{ padding: "24px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", boxShadow: "var(--shadow)" }}>
            <h3 style={{ marginBottom: "20px", color: "var(--text)" }}>Application Activity Trend (Last 6 Months)</h3>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                  <XAxis dataKey="month" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }} />
                  <Line type="monotone" dataKey="applications" stroke="var(--primary)" strokeWidth={3} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Application Status Chart */}
          <div style={{ padding: "24px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", boxShadow: "var(--shadow)", display: "flex", flexDirection: "column" }}>
            <h3 style={{ marginBottom: "20px", color: "var(--text)" }}>Applications by Status</h3>
            <div style={{ width: "100%", height: 300, display: "flex", justifyContent: "center", alignItems: "center" }}>
              {statusData.length > 0 ? (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => {
                        const originalIndex = ["Pending", "Reviewed", "Shortlisted", "Rejected", "Accepted"].indexOf(entry.name);
                        return <Cell key={`cell-${index}`} fill={COLORS[originalIndex !== -1 ? originalIndex : 0]} />;
                      })}
                    </Pie>
                    <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ color: "var(--text-secondary)" }}>No applications received yet to display status breakdown.</p>
              )}
            </div>
          </div>

          {/* Job Categories Chart */}
          <div style={{ gridColumn: "1 / -1", padding: "24px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", boxShadow: "var(--shadow)" }}>
            <h3 style={{ marginBottom: "20px", color: "var(--text)" }}>Job Distribution by Category</h3>
            <div style={{ width: "100%", height: 300 }}>
              {categoryDistribution.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={categoryDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" />
                    <YAxis stroke="var(--text-secondary)" allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }} />
                    <Bar dataKey="count" fill="var(--primary-light)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ color: "var(--text-secondary)", textAlign: "center", paddingTop: "50px" }}>No jobs posted yet.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Dashboard;
