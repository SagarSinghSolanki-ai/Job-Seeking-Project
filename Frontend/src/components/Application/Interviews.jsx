import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Context } from "../../main";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Calendar, Clock, Video, FileText, Check, X, AlertTriangle } from "lucide-react";

const getStatusColor = (status) => {
  switch (status) {
    case "Accepted":
      return "#28a745";
    case "Rejected":
    case "Cancelled":
      return "#dc3545";
    default:
      return "#f59e0b";
  }
};

const Interviews = () => {
  const [interviews, setInterviews] = useState([]);
  const { isAuthorized, user } = useContext(Context);
  const navigateTo = useNavigate();

  useEffect(() => {
    if (!isAuthorized) {
      navigateTo("/login");
    }
  }, [isAuthorized, navigateTo]);

  const fetchInterviews = () => {
    axios
      .get("https://jobzee-backend-ph70.onrender.com/api/v1/interview/me", { withCredentials: true })
      .then((res) => {
        if (res.data.success) {
          setInterviews(res.data.interviews);
        }
      })
      .catch((err) => {
        toast.error("Failed to load interview schedule.");
        console.error(err);
      });
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchInterviews();
    }
  }, [isAuthorized]);

  const handleUpdateStatus = (id, newStatus) => {
    axios
      .put(
        `https://jobzee-backend-ph70.onrender.com/api/v1/interview/update/${id}`,
        { status: newStatus },
        { withCredentials: true }
      )
      .then((res) => {
        toast.success(res.data.message);
        setInterviews((prev) =>
          prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item))
        );
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Failed to update interview status.");
      });
  };

  return (
    <section className="jobs page">
      <div className="container">
        <div className="page-header">
          <span className="section-label">Meetings</span>
          <h1>Interview Schedule</h1>
          <p>Manage and track all scheduled phone screenings and virtual technical rounds.</p>
        </div>

        <div className="banner" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "25px", marginTop: "20px" }}>
          {interviews && interviews.length > 0 ? (
            interviews.map((element) => {
              const otherPartyName = user?.role === "Employer" 
                ? element.applicantId?.name 
                : element.employerId?.name;
              
              const otherPartyEmail = user?.role === "Employer" 
                ? element.applicantId?.email 
                : element.employerId?.email;

              const otherPartyPhone = user?.role === "Employer" 
                ? element.applicantId?.phone 
                : element.employerId?.phone;

              return (
                <div
                  className="card"
                  key={element._id}
                  style={{
                    padding: "24px",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    boxShadow: "var(--shadow)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}
                >
                  <div>
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                      <h3 style={{ fontSize: "18px", color: "var(--text)", fontWeight: 700, margin: 0 }}>
                        {element.jobId?.title || "Position Title"}
                      </h3>
                      <span
                        style={{
                          color: "white",
                          backgroundColor: getStatusColor(element.status),
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "bold"
                        }}
                      >
                        {element.status}
                      </span>
                    </div>

                    {/* Participant Details */}
                    <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "15px" }}>
                      <strong>{user?.role === "Employer" ? "Candidate:" : "Interviewer:"}</strong> {otherPartyName} <br />
                      <span style={{ fontSize: "12px" }}>({otherPartyEmail} | {otherPartyPhone})</span>
                    </p>

                    <hr style={{ border: 0, borderTop: "1px solid var(--border-light)", marginBottom: "15px" }} />

                    {/* Meta info */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "15px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text)" }}>
                        <Calendar size={18} style={{ color: "var(--primary)" }} />
                        <span style={{ fontSize: "14px" }}>{element.date}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text)" }}>
                        <Clock size={18} style={{ color: "var(--primary)" }} />
                        <span style={{ fontSize: "14px" }}>{element.time}</span>
                      </div>
                      {element.meetingLink && (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text)" }}>
                          <Video size={18} style={{ color: "var(--primary)" }} />
                          <a
                            href={element.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: "14px", color: "#2d79f3", textDecoration: "underline" }}
                          >
                            Join Google Meet / Virtual Link
                          </a>
                        </div>
                      )}
                      {element.notes && (
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", color: "var(--text-secondary)", marginTop: "5px" }}>
                          <FileText size={18} style={{ color: "var(--text-muted)", marginTop: "2px" }} />
                          <span style={{ fontSize: "13px", fontStyle: "italic" }}>
                            <strong>Notes:</strong> {element.notes}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {element.status === "Pending" && (
                    <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                      {user?.role === "Job Seeker" ? (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(element._id, "Accepted")}
                            style={{
                              flex: 1,
                              padding: "8px 12px",
                              backgroundColor: "#28a745",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontWeight: "bold",
                              fontSize: "14px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "5px"
                            }}
                          >
                            <Check size={16} /> Accept
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(element._id, "Rejected")}
                            style={{
                              flex: 1,
                              padding: "8px 12px",
                              backgroundColor: "#dc3545",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontWeight: "bold",
                              fontSize: "14px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "5px"
                            }}
                          >
                            <X size={16} /> Decline
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(element._id, "Cancelled")}
                          style={{
                            flex: 1,
                            padding: "8px 12px",
                            backgroundColor: "#dc3545",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "bold",
                            fontSize: "14px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "5px"
                          }}
                        >
                          <AlertTriangle size={16} /> Cancel Slot
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
              <h4>No interviews scheduled</h4>
              <p>Your calendar will show slots once an interview is scheduled by a recruiter.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Interviews;
