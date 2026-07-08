import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Context } from "../../main";
const PostJob = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");
  const [salaryFrom, setSalaryFrom] = useState("");
  const [salaryTo, setSalaryTo] = useState("");
  const [fixedSalary, setFixedSalary] = useState("");
  const [salaryType, setSalaryType] = useState("default");

  const { isAuthorized, user } = useContext(Context);

  const handleJobPost = async (e) => {
    e.preventDefault();
    if (salaryType === "Fixed Salary") {
      setSalaryFrom("");
      setSalaryFrom("");
    } else if (salaryType === "Ranged Salary") {
      setFixedSalary("");
    } else {
      setSalaryFrom("");
      setSalaryTo("");
      setFixedSalary("");
    }
    await axios
      .post(
        "https://jobzee-backend-ph70.onrender.com/api/v1/job/post",
        fixedSalary.length >= 4
          ? {
              title,
              description,
              category,
              country,
              city,
              location,
              fixedSalary,
            }
          : {
              title,
              description,
              category,
              country,
              city,
              location,
              salaryFrom,
              salaryTo,
            },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        toast.success(res.data.message);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

  const navigateTo = useNavigate();
  if (!isAuthorized || (user && user.role !== "Employer")) {
    navigateTo("/");
  }

  return (
    <>
      <div className="job_post page">
        <div className="container">
          <div className="page-header">
            <span className="section-label">Employer</span>
            <h3>Post a New Job</h3>
            <p>Fill in the details below to publish a new job listing.</p>
          </div>
          <form onSubmit={handleJobPost}>
            <div className="wrapper">
              <div className="input-group">
                <label>Job Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Web Developer"
                />
              </div>
              <div className="input-group">
                <label>Job Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Select Category</option>
                  <option value="Graphics & Design">Graphics & Design</option>
                  <option value="Mobile App Development">
                    Mobile App Development
                  </option>
                  <option value="Frontend Web Development">
                    Frontend Web Development
                  </option>
                  <option value="MERN Stack Development">
                    MERN STACK Development
                  </option>
                  <option value="Account & Finance">Account & Finance</option>
                  <option value="Artificial Intelligence">
                    Artificial Intelligence
                  </option>
                  <option value="Video Animation">Video Animation</option>
                  <option value="MEAN Stack Development">
                    MEAN STACK Development
                  </option>
                  <option value="MEVN Stack Development">
                    MEVN STACK Development
                  </option>
                  <option value="Data Entry Operator">Data Entry Operator</option>
                </select>
              </div>
            </div>
            <div className="wrapper">
              <div className="input-group">
                <label>Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. India"
                />
              </div>
              <div className="input-group">
                <label>City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Chandigarh"
                />
              </div>
            </div>
            <div className="input-group">
              <label>Exact Location / Address</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Sector 17, Main Commercial Complex"
              />
            </div>
            <div className="salary_wrapper">
              <div className="input-group">
                <label>Salary Type</label>
                <select
                  value={salaryType}
                  onChange={(e) => setSalaryType(e.target.value)}
                >
                  <option value="default">Select Salary Type</option>
                  <option value="Fixed Salary">Fixed Salary</option>
                  <option value="Ranged Salary">Ranged Salary</option>
                </select>
              </div>
              <div className="salary_inputs">
                {salaryType === "default" ? (
                  <p className="salary-warning">Please provide Salary Type *</p>
                ) : salaryType === "Fixed Salary" ? (
                  <div className="input-group">
                    <label>Fixed Salary (Monthly / INR)</label>
                    <input
                      type="number"
                      placeholder="e.g. 50000"
                      value={fixedSalary}
                      onChange={(e) => setFixedSalary(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="ranged_salary">
                    <div className="input-group">
                      <label>Salary From</label>
                      <input
                        type="number"
                        placeholder="Min Salary"
                        value={salaryFrom}
                        onChange={(e) => setSalaryFrom(e.target.value)}
                      />
                    </div>
                    <div className="input-group">
                      <label>Salary To</label>
                      <input
                        type="number"
                        placeholder="Max Salary"
                        value={salaryTo}
                        onChange={(e) => setSalaryTo(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="input-group">
              <label>Job Description</label>
              <textarea
                rows="8"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Job Description (roles, responsibilities, requirements...)"
              />
            </div>
            <button type="submit">Create Job</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default PostJob;