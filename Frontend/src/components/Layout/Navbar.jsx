import { useContext, useState } from "react";
import { Context } from "../../main";
import { Link, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoClose } from "react-icons/io5";
import { Sun, Moon } from "lucide-react";

const Navbar = () => {
  const [show, setShow] = useState(false);
  const { isAuthorized, setIsAuthorized, user, theme, toggleTheme } = useContext(Context);
  const navigateTo = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await axios.get(
        "https://jobzee-backend-ph70.onrender.com/api/v1/user/logout",
        { withCredentials: true }
      );
      toast.success(response.data.message);
      setIsAuthorized(false);
      navigateTo("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not connect to server. Please try again.");
      setIsAuthorized(true);
    }
  };

  const closeMenu = () => setShow(false);
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "?";

  return (
    <nav className={isAuthorized ? "navbarShow" : "navbarHide"}>
      <div className="container">
        <div className="logo">
          <Link to="/" onClick={closeMenu}>
            <img src="/JobZee-logos__white.png" alt="JobZee" />
          </Link>
        </div>

        <ul className={!show ? "menu" : "show-menu menu"}>
          <li>
            <NavLink to="/" end onClick={closeMenu}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/job/getall" onClick={closeMenu}>
              All Jobs
            </NavLink>
          </li>
          <li>
            <NavLink to="/applications/me" onClick={closeMenu}>
              {user?.role === "Employer"
                ? "Applications"
                : "My Applications"}
            </NavLink>
          </li>
          {isAuthorized && (
            <li>
              <NavLink to="/interviews" onClick={closeMenu}>
                Interviews
              </NavLink>
            </li>
          )}
          {user?.role === "Job Seeker" && (
            <li>
              <NavLink to="/bookmarks" onClick={closeMenu}>
                Saved Jobs
              </NavLink>
            </li>
          )}
          {user?.role === "Employer" && (
            <>
              <li>
                <NavLink to="/dashboard" onClick={closeMenu}>
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/job/post" onClick={closeMenu}>
                  Post Job
                </NavLink>
              </li>
              <li>
                <NavLink to="/job/me" onClick={closeMenu}>
                  My Jobs
                </NavLink>
              </li>
            </>
          )}

          {user?.name && (
            <li className="nav-user">
              <div className="nav-avatar">{userInitial}</div>
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-role">{user.role}</span>
              </div>
            </li>
          )}

          <li style={{ display: "flex", alignItems: "center" }}>
            <button
              onClick={toggleTheme}
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                cursor: "pointer",
                padding: "8px",
                display: "flex",
                alignItems: "center"
              }}
              title="Toggle Theme"
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </li>
          <li>
            <button onClick={handleLogout}>Logout</button>
          </li>
        </ul>

        <div className="hamburger" onClick={() => setShow(!show)}>
          {show ? <IoClose /> : <GiHamburgerMenu />}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
