import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../../main";
import { HiOutlineLocationMarker } from "react-icons/hi";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const { isAuthorized } = useContext(Context);
  const navigateTo = useNavigate();

  useEffect(() => {
    const fetchJobs = () => {
      let url = "https://jobzee-backend-ph70.onrender.com/api/v1/job/getall?";
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (category) url += `category=${encodeURIComponent(category)}&`;
      if (city) url += `city=${encodeURIComponent(city)}&`;

      axios
        .get(url, { withCredentials: true })
        .then((res) => setJobs(res.data))
        .catch((error) => console.log(error));
    };

    fetchJobs();
  }, [search, category, city]);

  if (!isAuthorized) {
    navigateTo("/");
  }

  const categories = [
    "Graphics & Design",
    "Mobile App Development",
    "Frontend Web Development",
    "MERN Stack Development",
    "Account & Finance",
    "Artificial Intelligence",
    "Video Animation",
    "MEVN Stack Development"
  ];

  return (
    <section className="jobs page">
      <div className="container">
        <div className="page-header">
          <span className="section-label">Opportunities</span>
          <h1>All Available Jobs</h1>
          <p>Explore open positions and find the role that matches your skills.</p>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar-container">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search jobs by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="select-wrapper">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="city-wrapper">
            <input
              type="text"
              placeholder="Filter by city..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          {(search || category || city) && (
            <button
              onClick={() => {
                setSearch("");
                setCategory("");
                setCity("");
              }}
              className="clear-filters-btn"
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="banner">
          {jobs.jobs && jobs.jobs.length > 0 ? (
            jobs.jobs.map((element) => (
              <div className="card" key={element._id}>
                <p className="job-title">{element.title}</p>
                <span className="job-category">{element.category}</span>
                <p className="job-location">
                  <HiOutlineLocationMarker />
                  {element.city}, {element.country}
                </p>
                <Link to={`/job/${element._id}`} className="job-link">
                  View Details
                </Link>
              </div>
            ))
          ) : (
            <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
              <h4>No jobs found matching search criteria</h4>
              <p>Check back soon or post a new job if you're an employer.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Jobs;
