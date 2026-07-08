import express from "express"
import { employerGetAllApplications, jobSeekerDeleteApplication, jobSeekerGetAllApplications, postApplication, updateApplicationStatus } from "../controllers/applicationController.js";
import { isAuthorized } from "../middlewares/auth.js"
const router = express.Router()

router.get("/jobseeker/getall" , isAuthorized, jobSeekerGetAllApplications)
router.get("/employer/getall" , isAuthorized, employerGetAllApplications)
router.delete("/delete/:id", isAuthorized, jobSeekerDeleteApplication)
router.post("/post",isAuthorized,postApplication)
router.put("/update/:id", isAuthorized, updateApplicationStatus)

export default router;
