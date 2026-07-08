import React, { useContext } from "react";
import { Context } from "../../main";
import { Link } from "react-router-dom";
import { FaFacebookF, FaYoutube, FaLinkedin } from "react-icons/fa";
import { RiInstagramFill } from "react-icons/ri";

const Footer = () => {
  const { isAuthorized } = useContext(Context);

  return (
    <footer className={isAuthorized ? "footerShow" : "footerHide"}>
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <img src="/JobZee-logos__white.png" alt="JobZee" />
            <p>
              A full-stack job portal connecting talented professionals with
              top employers. Built with the MERN stack.
            </p>
          </div>
          <div className="footer-links">
            <h4>Platform</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/job/getall">Browse Jobs</Link></li>
              <li><Link to="/applications/me">Applications</Link></li>
              <li><Link to="/job/post">Post a Job</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Account</h4>
            <ul>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
              <li><Link to="/job/me">Manage Jobs</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} JobZee. All rights reserved.</p>
          <div className="social-links">
            <Link to="https://www.facebook.com/profile.php?id=100030535123397" target="_blank" aria-label="Facebook">
              <FaFacebookF />
            </Link>
            <Link to="https://www.youtube.com/@CodeWithZeeshu" target="_blank" aria-label="YouTube">
              <FaYoutube />
            </Link>
            <Link to="https://www.linkedin.com" target="_blank" aria-label="LinkedIn">
              <FaLinkedin />
            </Link>
            <Link to="https://www.instagram.com/z_4_zeeshuuu/" target="_blank" aria-label="Instagram">
              <RiInstagramFill />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
