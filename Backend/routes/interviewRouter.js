import express from "express";
import { getUserInterviews, scheduleInterview, updateInterviewStatus } from "../controllers/interviewController.js";
import { isAuthorized } from "../middlewares/auth.js";

const router = express.Router();

router.post("/schedule", isAuthorized, scheduleInterview);
router.get("/me", isAuthorized, getUserInterviews);
router.put("/update/:id", isAuthorized, updateInterviewStatus);

export default router;
