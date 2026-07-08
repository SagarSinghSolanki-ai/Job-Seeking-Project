import express from "express"
import { logout, login, register, getUser, toggleBookmarkJob, getBookmarkedJobs } from "../controllers/userController.js";
import { isAuthorized } from "../middlewares/auth.js";
import rateLimit from "express-rate-limit";

// Rate limiter for auth endpoints (max 15 attempts per 15 minutes to prevent brute-force attacks)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    message: "Too many login/registration attempts from this IP. Please try again after 15 minutes."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = express.Router();

router.post("/register", authLimiter, register)
router.post("/login", authLimiter, login)
router.get("/logout", isAuthorized, logout)
router.get("/getuser", isAuthorized, getUser)
router.put("/bookmark/:jobId", isAuthorized, toggleBookmarkJob)
router.get("/bookmarks", isAuthorized, getBookmarkedJobs)

export default router;
