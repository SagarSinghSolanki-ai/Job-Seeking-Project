import { useContext, useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Context } from "../../main";
import { HiOutlineLocationMarker } from "react-icons/hi";
import toast from "react-hot-toast";

const JobDetails = () => {
  const { id } = useParams();
  const [job, setJob] = useState({});
  const navigateTo = useNavigate();
  const { isAuthorized, user, setUser } = useContext(Context);

  useEffect(() => {
    axios
      .get(`http://localhost:4000/api/v1/job/${id}`, { withCredentials: true })
      .then((res) => {
        setJob(res.data.job);
      })
      .catch(() => navigateTo("/notfound"));
  }, [id, navigateTo]);

  const isBookmarked = user && user.savedJobs && user.savedJobs.includes(id);

  if (!isAuthorized) {
    navigateTo("/login");
  }

  const toggleBookmark = async () => {
    try {
      const { data } = await axios.put(
        `http://localhost:4000/api/v1/user/bookmark/${id}`,
        {},
        { withCredentials: true }
      );
      toast.success(data.message);
      
      if (user) {
        let updatedSavedJobs;
        if (data.isBookmarked) {
          updatedSavedJobs = [...(user.savedJobs || []), id];
        } else {
          updatedSavedJobs = (user.savedJobs || []).filter(jobId => jobId !== id);
        }
        setUser({ ...user, savedJobs: updatedSavedJobs });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const salary = job.fixedSalary
    ? `$${job.fixedSalary}`
    : job.salaryFrom
    ? `$${job.salaryFrom} – $${job.salaryTo}`
    : "Not specified";

  return (
    <section className="jobDetail page">
      <div className="container">
        <div className="page-header">
          <span className="section-label">Job Details</span>
        </div>

        <div className="banner">
          <div className="detail-header">
            <h2>{job.title || "Loading..."}</h2>
            <div className="detail-meta">
              {job.category && <span className="badge">{job.category}</span>}
              {job.country && (
                <span className="badge badge-employer">
                  <HiOutlineLocationMarker style={{ marginRight: 4 }} />
                  {job.city}, {job.country}
                </span>
              )}
            </div>
          </div>

          <div className="detail-grid">
            <div className="detail-item">
              <label>Location</label>
              <span>{job.location || "—"}</span>
            </div>
            <div className="detail-item">
              <label>Salary</label>
              <span>{salary}</span>
            </div>
            <div className="detail-item">
              <label>Posted On</label>
              <span>
                {job.jobPostedOn
                  ? new Date(job.jobPostedOn).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "—"}
              </span>
            </div>
            <div className="detail-item">
              <label>Country</label>
              <span>{job.country || "—"}</span>
            </div>
          </div>

          {job.description && (
            <div className="detail-description">
              <label>Description</label>
              <p>{job.description}</p>
            </div>
          )}

          {user?.role !== "Employer" && job._id && (
            <div style={{ display: "flex", gap: "10px", marginTop: "20px", alignItems: "center" }}>
              <Link to={`/application/${job._id}`} className="apply-btn" style={{ padding: "10px 20px", backgroundColor: "#2d79f3", color: "white", borderRadius: "5px", textDecoration: "none", fontWeight: "bold" }}>
                Apply Now
              </Link>
              <button
                onClick={toggleBookmark}
                style={{
                  padding: "10px 20px",
                  backgroundColor: isBookmarked ? "#dc3545" : "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                {isBookmarked ? "Remove Saved" : "Save Job"}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default JobDetails;
