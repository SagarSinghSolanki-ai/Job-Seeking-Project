import { useContext, useEffect } from "react";
import "./App.css";
import { Context } from "./main";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import { Toaster } from "react-hot-toast";
import axios from "axios";
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import Home from "./components/Home/Home";
import Jobs from "./components/Job/Jobs";
import JobDetails from "./components/Job/JobDetails";
import Application from "./components/Application/Application";
import MyApplications from "./components/Application/MyApplications";
import PostJob from "./components/Job/PostJob";
import NotFound from "./components/NotFound/NotFound";
import MyJobs from "./components/Job/MyJobs";
import SavedJobs from "./components/Job/SavedJobs";
import Dashboard from "./components/Home/Dashboard";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import Interviews from "./components/Application/Interviews";

const App = () => {
  const { isAuthorized, setIsAuthorized, setUser, user } = useContext(Context);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          "https://jobzee-backend-ph70.onrender.com/api/v1/user/getuser",
          {
            withCredentials: true,
          }
        );
        setUser(response.data.user);
        setIsAuthorized(true);
      } catch {
        setIsAuthorized(false);
      }
    };
    fetchUser();
  }, [setIsAuthorized, setUser]);

  useEffect(() => {
    if (isAuthorized && user && user._id) {
      const socket = io("https://jobzee-backend-ph70.onrender.com");
      socket.emit("register", user._id);

      socket.on("statusUpdated", (data) => {
        toast.success(data.message, { duration: 6000 });
      });

      socket.on("interviewScheduled", (data) => {
        toast.success(data.message, { duration: 8000 });
      });

      socket.on("interviewStatusUpdated", (data) => {
        toast.success(data.message, { duration: 8000 });
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [isAuthorized, user]);

  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
          <Route path="/job/getall" element={<Jobs />} />
          <Route path="/job/:id" element={<JobDetails />} />
          <Route path="/application/:id" element={<Application />} />
          <Route path="/applications/me" element={<MyApplications />} />
          <Route path="/bookmarks" element={<SavedJobs />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/interviews" element={<Interviews />} />
          <Route path="/job/post" element={<PostJob />} />
          <Route path="/job/me" element={<MyJobs />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
        <Toaster />
      </BrowserRouter>
    </>
  );
};

export default App;