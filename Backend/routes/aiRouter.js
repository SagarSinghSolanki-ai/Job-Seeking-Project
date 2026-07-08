import express from "express";
import { checkATSScore, generateCoverLetter, parseResume } from "../controllers/aiController.js";
import { isAuthorized } from "../middlewares/auth.js";

const router = express.Router();

router.post("/parse", isAuthorized, parseResume);
router.post("/cover-letter", isAuthorized, generateCoverLetter);
router.post("/ats-score", isAuthorized, checkATSScore);

export default router;
