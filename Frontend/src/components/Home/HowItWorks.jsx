import React from "react";
import { FaUserPlus } from "react-icons/fa";
import { MdFindInPage } from "react-icons/md";
import { IoMdSend } from "react-icons/io";

const HowItWorks = () => {
  const steps = [
    {
      step: "01",
      icon: <FaUserPlus />,
      title: "Create Your Account",
      description:
        "Sign up as a Job Seeker or Employer in under a minute. Choose your role and get started instantly.",
    },
    {
      step: "02",
      icon: <MdFindInPage />,
      title: "Find or Post a Job",
      description:
        "Browse curated listings across categories, or post openings and reach qualified candidates quickly.",
    },
    {
      step: "03",
      icon: <IoMdSend />,
      title: "Apply or Hire",
      description:
        "Submit applications with resume uploads, or review applicant profiles and make hiring decisions.",
    },
  ];

  return (
    <div className="howitworks">
      <div className="container">
        <div className="section-header">
          <span className="section-label">How It Works</span>
          <h3>Get Started in Three Simple Steps</h3>
          <p>
            Whether you're looking for your next role or building your team,
            JobZee makes the process seamless.
          </p>
        </div>
        <div className="banner">
          {steps.map((item) => (
            <div className="card" key={item.step}>
              <span className="step-number">{item.step}</span>
              {item.icon}
              <p>{item.title}</p>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
