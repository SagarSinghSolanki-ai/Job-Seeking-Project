import React from "react";
import { Link } from "react-router-dom";
import { FaMicrosoft, FaApple } from "react-icons/fa";
import { SiTesla } from "react-icons/si";

const PopularCompanies = () => {
  const companies = [
    { id: 1, title: "Microsoft", location: "Redmond, Washington", openPositions: 10, icon: <FaMicrosoft /> },
    { id: 2, title: "Tesla", location: "Austin, Texas", openPositions: 5, icon: <SiTesla /> },
    { id: 3, title: "Apple", location: "Cupertino, California", openPositions: 20, icon: <FaApple /> },
  ];

  return (
    <div className="companies">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Top Companies</span>
          <h3>Featured Employers</h3>
          <p>Join industry leaders who are actively hiring on JobZee.</p>
        </div>
        <div className="banner">
          {companies.map((element) => (
            <div className="card" key={element.id}>
              <div className="content">
                <div className="icon">{element.icon}</div>
                <div className="text">
                  <p>{element.title}</p>
                  <p>{element.location}</p>
                </div>
              </div>
              <Link to="/job/getall" className="company-link">
                {element.openPositions} Open Positions
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopularCompanies;
