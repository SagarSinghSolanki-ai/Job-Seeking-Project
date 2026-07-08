import { useContext, useEffect, useState } from "react";
import { Context } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ResumeModal from "./ResumeModal";
import { Sparkles, Calendar, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const getStatusColor = (status) => {
  switch (status) {
    case "Accepted":
      return "#28a745";
    case "Rejected":
      return "#dc3545";
    case "Shortlisted":
      return "#fd7e14";
    case "Reviewed":
      return "#17a2b8";
    default:
      return "#6c757d";
  }
};

const MyApplications = () => {
  const { user, isAuthorized } = useContext(Context);
  const [applications, setApplications] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [resumeImageUrl, setResumeImageUrl] = useState("");
  const navigateTo = useNavigate();

  // AI & Interview states
  const [loadingAts, setLoadingAts] = useState(false);
  const [atsResult, setAtsResult] = useState(null);
  const [showAtsModal, setShowAtsModal] = useState(false);
  
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [scheduleData, setScheduleData] = useState({
    date: "",
    time: "",
    meetingLink: "",
    notes: ""
  });

  useEffect(() => {
    if (!isAuthorized) {
      navigateTo("/");
      return;
    }

    const endpoint = user?.role === "Employer" 
      ? "https://jobzee-backend-ph70.onrender.com/api/v1/application/employer/getall"
      : "https://jobzee-backend-ph70.onrender.com/api/v1/application/jobseeker/getall";

    axios
      .get(endpoint, { withCredentials: true })
      .then((res) => {
        setApplications(res.data.applications);
      })
      .catch((err) => {
        toast.error("Failed to load applications.");
        console.error(err);
      });
  }, [isAuthorized, user, navigateTo]);

  const deleteApplication = (id) => {
    axios
      .delete(`https://jobzee-backend-ph70.onrender.com/api/v1/application/delete/${id}`, {
        withCredentials: true,
      })
      .then((res) => {
        toast.success(res.data.message);
        setApplications((prev) => prev.filter((app) => app._id !== id));
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Failed to delete application.");
      });
  };

  const updateStatus = (id, newStatus) => {
    axios
      .put(`https://jobzee-backend-ph70.onrender.com/api/v1/application/update/${id}`, { status: newStatus }, {
        withCredentials: true,
      })
      .then((res) => {
        toast.success(res.data.message);
        setApplications((prev) =>
          prev.map((app) => (app._id === id ? { ...app, status: newStatus } : app))
        );
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Failed to update status.");
      });
  };

  const openModal = (imageUrl) => {
    setResumeImageUrl(imageUrl);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const checkAtsScore = async (appId) => {
    setLoadingAts(true);
    try {
      const { data } = await axios.post(
        "https://jobzee-backend-ph70.onrender.com/api/v1/ai/ats-score",
        { applicationId: appId },
        { withCredentials: true }
      );
      if (data.success) {
        setAtsResult(data.data);
        setShowAtsModal(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to run ATS scanner.");
    } finally {
      setLoadingAts(false);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      const { data } = await axios.post(
        "https://jobzee-backend-ph70.onrender.com/api/v1/interview/schedule",
        {
          applicantId: selectedApp.applicantID.user,
          jobId: selectedApp.jobId?._id || selectedApp.jobId,
          date: scheduleData.date,
          time: scheduleData.time,
          meetingLink: scheduleData.meetingLink,
          notes: scheduleData.notes
        },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success(
          data.interview.meetingLink.includes("mock")
            ? "[Demo Mode] Interview scheduled slot created."
            : "Interview invitation sent successfully!"
        );
        setShowScheduleModal(false);
        setScheduleData({ date: "", time: "", meetingLink: "", notes: "" });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to schedule interview.");
    }
  };

  return (
    <section className="my_applications page">
      {user && user.role === "Job Seeker" ? (
        <div className="container">
          <div className="page-header">
            <span className="section-label">Your Activity</span>
            <h1>My Applications</h1>
            <p>Track all the jobs you've applied to in one place.</p>
          </div>
          {applications.length <= 0 ? (
            <div className="empty-state">
              <h4>No applications yet</h4>
              <p>Browse available jobs and submit your first application.</p>
            </div>
          ) : (
            applications.map((element) => (
              <JobSeekerCard
                element={element}
                key={element._id}
                deleteApplication={deleteApplication}
                openModal={openModal}
                checkAtsScore={checkAtsScore}
                loadingAts={loadingAts}
              />
            ))
          )}
        </div>
      ) : (
        <div className="container">
          <div className="page-header">
            <span className="section-label">Recruitment</span>
            <h1>Applications From Job Seekers</h1>
            <p>Review candidate applications and resumes for your posted jobs.</p>
          </div>
          {applications.length <= 0 ? (
            <div className="empty-state">
              <h4>No applications received yet</h4>
              <p>Applications will appear here once candidates apply to your jobs.</p>
            </div>
          ) : (
            applications.map((element) => (
              <EmployerCard
                element={element}
                key={element._id}
                openModal={openModal}
                updateStatus={updateStatus}
                checkAtsScore={checkAtsScore}
                loadingAts={loadingAts}
                onScheduleClick={(app) => {
                  setSelectedApp(app);
                  setShowScheduleModal(true);
                }}
              />
            ))
          )}
        </div>
      )}

      {/* Resume Viewer Modal */}
      {modalOpen && <ResumeModal imageUrl={resumeImageUrl} onClose={closeModal} />}

      {/* ATS Scanner Result Modal */}
      {showAtsModal && atsResult && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            zIndex: 1000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backdropFilter: "blur(4px)"
          }}
        >
          <div
            style={{
              background: "var(--surface)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "30px",
              width: "100%",
              maxWidth: "550px",
              boxShadow: "var(--shadow-lg)",
              maxHeight: "90vh",
              overflowY: "auto"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <Sparkles size={24} style={{ color: "var(--accent)" }} />
              <h2 style={{ fontSize: "20px", fontWeight: "bold", margin: 0 }}>Gemini AI ATS Scanner</h2>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "20px", padding: "15px", background: "var(--bg)", borderRadius: "8px" }}>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: atsResult.score >= 70 ? "#28a745" : "#fd7e14",
                  padding: "10px",
                  border: "2px solid",
                  borderColor: atsResult.score >= 70 ? "#28a745" : "#fd7e14",
                  borderRadius: "50%",
                  width: "60px",
                  height: "60px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {atsResult.score}%
              </div>
              <div>
                <h4 style={{ margin: 0, fontWeight: "bold" }}>Match Percentage</h4>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>
                  Compatibility match with the target job description.
                </p>
              </div>
            </div>

            {/* Matched Keywords */}
            <div style={{ marginBottom: "15px" }}>
              <h5 style={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: "5px", marginBottom: "8px" }}>
                <CheckCircle size={16} style={{ color: "#28a745" }} /> Matched Keywords
              </h5>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {atsResult.matchedKeywords && atsResult.matchedKeywords.length > 0 ? (
                  atsResult.matchedKeywords.map((tag, i) => (
                    <span key={i} style={{ padding: "4px 8px", background: "rgba(40,167,69,0.12)", color: "#28a745", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" }}>
                      {tag}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>None identified</span>
                )}
              </div>
            </div>

            {/* Missing Keywords */}
            <div style={{ marginBottom: "20px" }}>
              <h5 style={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: "5px", marginBottom: "8px" }}>
                <AlertCircle size={16} style={{ color: "#dc3545" }} /> Missing Keywords
              </h5>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {atsResult.missingKeywords && atsResult.missingKeywords.length > 0 ? (
                  atsResult.missingKeywords.map((tag, i) => (
                    <span key={i} style={{ padding: "4px 8px", background: "rgba(220,53,69,0.12)", color: "#dc3545", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" }}>
                      {tag}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>None identified</span>
                )}
              </div>
            </div>

            {/* AI Advice */}
            <div style={{ padding: "15px", background: "var(--bg)", borderLeft: "4px solid var(--accent)", borderRadius: "0 8px 8px 0", marginBottom: "25px" }}>
              <h5 style={{ margin: "0 0 6px 0", fontWeight: "bold" }}>Improvement Feedback</h5>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>{atsResult.feedback}</p>
            </div>

            <button
              onClick={() => setShowAtsModal(false)}
              style={{
                width: "100%",
                padding: "10px",
                background: "var(--primary)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              Close Analyzer
            </button>
          </div>
        </div>
      )}

      {/* Scheduler Modal */}
      {showScheduleModal && selectedApp && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            zIndex: 1000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backdropFilter: "blur(4px)"
          }}
        >
          <form
            onSubmit={handleScheduleSubmit}
            style={{
              background: "var(--surface)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "30px",
              width: "100%",
              maxWidth: "500px",
              boxShadow: "var(--shadow-lg)"
            }}
          >
            <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Calendar size={22} style={{ color: "var(--primary)" }} /> Schedule Interview
            </h3>
            
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "20px" }}>
              Invite <strong>{selectedApp.name}</strong> to a screening or technical round for position: <br />
              <strong>{selectedApp.jobId?.title || "Role"}</strong>
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px" }}>Date</label>
                <input
                  type="date"
                  value={scheduleData.date}
                  onChange={(e) => setScheduleData(p => ({ ...p, date: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "6px", background: "var(--bg)", color: "var(--text)" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px" }}>Time</label>
                <input
                  type="time"
                  value={scheduleData.time}
                  onChange={(e) => setScheduleData(p => ({ ...p, time: e.target.value }))}
                  required
                  style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "6px", background: "var(--bg)", color: "var(--text)" }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px" }}>Meeting Link (Google Meet/Teams)</label>
              <input
                type="url"
                placeholder="https://meet.google.com/..."
                value={scheduleData.meetingLink}
                onChange={(e) => setScheduleData(p => ({ ...p, meetingLink: e.target.value }))}
                style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "6px", background: "var(--bg)", color: "var(--text)" }}
              />
            </div>

            <div style={{ marginBottom: "25px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px" }}>Notes / Special Instructions</label>
              <textarea
                placeholder="Prepare system architecture slides, coding environment..."
                value={scheduleData.notes}
                onChange={(e) => setScheduleData(p => ({ ...p, notes: e.target.value }))}
                rows={3}
                style={{ width: "100%", padding: "8px", border: "1px solid var(--border)", borderRadius: "6px", background: "var(--bg)", color: "var(--text)" }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "var(--primary)",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                Schedule & Invite
              </button>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "var(--bg)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};

export default MyApplications;

const JobSeekerCard = ({ element, deleteApplication, openModal, checkAtsScore, loadingAts }) => {
  return (
    <div className="job_seeker_card" style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "24px", borderRadius: "12px", boxShadow: "var(--shadow)", marginBottom: "20px", display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "space-between" }}>
      <div className="detail" style={{ flex: 1, minWidth: "280px" }}>
        <p style={{ margin: "0 0 8px 0", color: "var(--text)" }}><span style={{ fontWeight: "bold" }}>Job Applied:</span> {element.jobId?.title || "Position"}</p>
        <p style={{ margin: "0 0 8px 0", color: "var(--text)" }}><span style={{ fontWeight: "bold" }}>Name:</span> {element.name}</p>
        <p style={{ margin: "0 0 8px 0", color: "var(--text)" }}><span style={{ fontWeight: "bold" }}>Email:</span> {element.email}</p>
        <p style={{ margin: "0 0 8px 0", color: "var(--text)" }}><span style={{ fontWeight: "bold" }}>Phone:</span> {element.phone}</p>
        <p style={{ margin: "0 0 8px 0", color: "var(--text)" }}><span style={{ fontWeight: "bold" }}>Address:</span> {element.address}</p>
        <p style={{ margin: "0 0 8px 0", color: "var(--text-secondary)", fontSize: "14px" }}><span style={{ fontWeight: "bold", color: "var(--text)" }}>CoverLetter:</span> {element.coverLetter}</p>
        <p style={{ margin: "10px 0 0 0" }}>
          <span style={{ fontWeight: "bold", marginRight: "10px", color: "var(--text)" }}>Status:</span>
          <span style={{ color: "white", backgroundColor: getStatusColor(element.status), padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>
            {element.status || "Pending"}
          </span>
        </p>
      </div>

      <div className="resume" style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
        {element.resume?.url?.toLowerCase().endsWith(".pdf") ? (
          <div
            style={{ width: "140px", height: "140px", border: "1px solid var(--border)", borderRadius: "8px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", backgroundColor: "var(--bg)" }}
            onClick={() => openModal(element.resume.url)}
          >
            <span style={{ fontSize: "36px" }}>📄</span>
            <span style={{ fontWeight: "bold", marginTop: "5px", color: "var(--text)", fontSize: "12px" }}>PDF Resume</span>
          </div>
        ) : (
          <img src={element.resume?.url} alt="resume" style={{ width: "140px", height: "140px", objectFit: "cover", borderRadius: "8px", cursor: "pointer" }} onClick={() => openModal(element.resume.url)} />
        )}

        {/* ATS Score Check Button */}
        {element.resumeText && (
          <button
            onClick={() => checkAtsScore(element._id)}
            disabled={loadingAts}
            style={{
              padding: "6px 12px",
              background: "var(--accent-light)",
              color: "var(--accent)",
              border: "1px solid var(--accent)",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            {loadingAts ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            Scan ATS Match
          </button>
        )}
      </div>

      <div className="btn_area" style={{ width: "100%", borderTop: "1px solid var(--border-light)", paddingTop: "15px", display: "flex", justifyContent: "flex-end" }}>
        <button onClick={() => deleteApplication(element._id)} style={{ padding: "8px 16px", background: "var(--danger)", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
          Delete Application
        </button>
      </div>
    </div>
  );
};

const EmployerCard = ({ element, openModal, updateStatus, checkAtsScore, loadingAts, onScheduleClick }) => {
  const statuses = ["Pending", "Reviewed", "Shortlisted", "Rejected", "Accepted"];

  return (
    <div className="job_seeker_card" style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "24px", borderRadius: "12px", boxShadow: "var(--shadow)", marginBottom: "20px", display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "space-between" }}>
      <div className="detail" style={{ flex: 1, minWidth: "280px" }}>
        <p style={{ margin: "0 0 8px 0", color: "var(--text)" }}><span style={{ fontWeight: "bold" }}>Position:</span> {element.jobId?.title || "Role"}</p>
        <p style={{ margin: "0 0 8px 0", color: "var(--text)" }}><span style={{ fontWeight: "bold" }}>Candidate Name:</span> {element.name}</p>
        <p style={{ margin: "0 0 8px 0", color: "var(--text)" }}><span style={{ fontWeight: "bold" }}>Email:</span> {element.email}</p>
        <p style={{ margin: "0 0 8px 0", color: "var(--text)" }}><span style={{ fontWeight: "bold" }}>Phone:</span> {element.phone}</p>
        <p style={{ margin: "0 0 8px 0", color: "var(--text)" }}><span style={{ fontWeight: "bold" }}>Address:</span> {element.address}</p>
        <p style={{ margin: "0 0 8px 0", color: "var(--text-secondary)", fontSize: "14px" }}><span style={{ fontWeight: "bold", color: "var(--text)" }}>CoverLetter:</span> {element.coverLetter}</p>
        
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", marginTop: "15px" }}>
          <div>
            <span style={{ fontWeight: "bold", marginRight: "6px", color: "var(--text)" }}>Status:</span>
            <select
              value={element.status || "Pending"}
              onChange={(e) => updateStatus(element._id, e.target.value)}
              style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text)", fontWeight: "bold", cursor: "pointer" }}
            >
              {statuses.map((status, idx) => (
                <option key={idx} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Schedule Trigger */}
          {element.status === "Shortlisted" && (
            <button
              onClick={() => onScheduleClick(element)}
              style={{
                padding: "6px 12px",
                background: "var(--primary)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <Calendar size={12} /> Schedule Interview
            </button>
          )}
        </div>
      </div>

      <div className="resume" style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
        {element.resume?.url?.toLowerCase().endsWith(".pdf") ? (
          <div
            style={{ width: "140px", height: "140px", border: "1px solid var(--border)", borderRadius: "8px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", backgroundColor: "var(--bg)" }}
            onClick={() => openModal(element.resume.url)}
          >
            <span style={{ fontSize: "36px" }}>📄</span>
            <span style={{ fontWeight: "bold", marginTop: "5px", color: "var(--text)", fontSize: "12px" }}>PDF Resume</span>
          </div>
        ) : (
          <img src={element.resume?.url} alt="resume" style={{ width: "140px", height: "140px", objectFit: "cover", borderRadius: "8px", cursor: "pointer" }} onClick={() => openModal(element.resume.url)} />
        )}

        {/* ATS Score Check Button */}
        {element.resumeText && (
          <button
            onClick={() => checkAtsScore(element._id)}
            disabled={loadingAts}
            style={{
              padding: "6px 12px",
              background: "var(--accent-light)",
              color: "var(--accent)",
              border: "1px solid var(--accent)",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            {loadingAts ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            Scan ATS Match
          </button>
        )}
      </div>
    </div>
  );
};