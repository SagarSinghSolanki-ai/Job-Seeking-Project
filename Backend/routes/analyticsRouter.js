import express from "express";
import { getEmployerAnalytics } from "../controllers/analyticsController.js";
import { isAuthorized } from "../middlewares/auth.js";

const router = express.Router();

router.get("/employer", isAuthorized, getEmployerAnalytics);

export default router;
