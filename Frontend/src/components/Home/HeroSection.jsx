import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { FaBuilding, FaSuitcase, FaUsers, FaUserPlus } from "react-icons/fa";
import { HiArrowRight } from "react-icons/hi";
import { Context } from "../../main";

const HeroSection = () => {
  const { user } = useContext(Context);
  const details = [
    { id: 1, title: "1,23,441", subTitle: "Live Jobs", icon: <FaSuitcase /> },
    { id: 2, title: "91,220", subTitle: "Companies", icon: <FaBuilding /> },
    { id: 3, title: "2,34,200", subTitle: "Job Seekers", icon: <FaUsers /> },
    { id: 4, title: "1,03,761", subTitle: "Employers", icon: <FaUserPlus /> },
  ];

  return (
    <div className="heroSection">
      <div className="container">
        <div className="title">
          <h1>
            Find a job that suits{" "}
            <span className="highlight">your interests</span> and skills
          </h1>
          <p>
            Discover thousands of job opportunities from top companies.
            Apply in seconds, track your applications, and land your dream role.
          </p>
          <div className="hero-actions">
            {user?.role === "Job Seeker" ? (
              <>
                <Link to="/job/getall" className="btn-primary">
                  Browse Jobs <HiArrowRight />
                </Link>
                <Link to="/applications/me" className="btn-secondary">
                  View My Applications
                </Link>
              </>
            ) : (
              <>
                <Link to="/job/post" className="btn-primary">
                  Post a Job <HiArrowRight />
                </Link>
                <Link to="/job/me" className="btn-secondary">
                  Manage Posted Jobs
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="image">
          <img src="/heroS.jpg" alt="Professional team collaborating" />
        </div>
      </div>

      <div className="details">
        {details.map((element) => (
          <div className="card" key={element.id}>
            <div className="icon">{element.icon}</div>
            <div className="content">
              <p>{element.title}</p>
              <p>{element.subTitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroSection;
