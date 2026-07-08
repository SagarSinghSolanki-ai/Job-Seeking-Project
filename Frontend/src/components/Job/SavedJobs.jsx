import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../../main";
import { HiOutlineLocationMarker } from "react-icons/hi";
import toast from "react-hot-toast";

const SavedJobs = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const { isAuthorized, user, setUser } = useContext(Context);
  const navigateTo = useNavigate();

  useEffect(() => {
    if (!isAuthorized || user?.role === "Employer") {
      navigateTo("/");
    }
  }, [isAuthorized, user, navigateTo]);

  const fetchSavedJobs = () => {
    axios
      .get("https://jobzee-backend-ph70.onrender.com/api/v1/user/bookmarks", { withCredentials: true })
      .then((res) => setBookmarks(res.data.bookmarks))
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    if (isAuthorized && user?.role === "Job Seeker") {
      fetchSavedJobs();
    }
  }, [isAuthorized, user]);

  const removeBookmark = async (jobId) => {
    try {
      const { data } = await axios.put(
        `https://jobzee-backend-ph70.onrender.com/api/v1/user/bookmark/${jobId}`,
        {},
        { withCredentials: true }
      );
      toast.success(data.message);
      setBookmarks((prev) => prev.filter((job) => job._id !== jobId));
      
      if (user) {
        const updatedSavedJobs = (user.savedJobs || []).filter(id => id !== jobId);
        setUser({ ...user, savedJobs: updatedSavedJobs });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <section className="jobs page">
      <div className="container">
        <div className="page-header">
          <span className="section-label">Your Saved Jobs</span>
          <h1>My Bookmarks</h1>
          <p>View and manage all the positions you've saved for later.</p>
        </div>

        <div className="banner">
          {bookmarks && bookmarks.length > 0 ? (
            bookmarks.map((element) => (
              <div className="card" key={element._id} style={{ position: "relative" }}>
                <p className="job-title">{element.title}</p>
                <span className="job-category">{element.category}</span>
                <p className="job-location">
                  <HiOutlineLocationMarker />
                  {element.city}, {element.country}
                </p>
                <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                  <Link to={`/job/${element._id}`} className="job-link" style={{ textDecoration: "none", flex: 1, textAlign: "center" }}>
                    View Details
                  </Link>
                  <button
                    onClick={() => removeBookmark(element._id)}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontSize: "14px"
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
              <h4>No saved jobs</h4>
              <p>Go to the job list and save jobs to see them here.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SavedJobs;
