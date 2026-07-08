import { catchAsyncError } from "../middlewares/catchAsyncError.js"
import ErrorHandler, {} from "../middlewares/error.js"
import { Application } from "../models/applicationSchema.js";
import { Job } from "../models/jobSchema.js"
import { User } from "../models/userSchema.js"
import { sendEmail } from "../utils/sendEmail.js"
import cloudinary from "cloudinary";
import fs from "fs";
import { PDFParse } from "pdf-parse";
import { emitSocketEvent } from "../utils/socket.js";

export const employerGetAllApplications = catchAsyncError(async(req,res,next)=>{
    const {role} = req.user;

    if(role==="Job Seeker"){
        return next(new ErrorHandler("Job Seeker is not allowed to access this resource",400))
    }

    const {_id} = req.user;

    const applications = await Application.find({"employerID.user" : _id}).populate("jobId");

    res.status(200).json({
        success: true,
        applications,
    });
});

export const jobSeekerGetAllApplications = catchAsyncError(async(req,res,next)=>{
    const {role} = req.user;

    if(role==="Employer"){
        return next(new ErrorHandler("Employer is not allowed to access this resource",400))
    }

    const {_id} = req.user;

    const applications = await Application.find({"applicantID.user" : _id}).populate("jobId");

    res.status(200).json({
        success: true,
        applications,
    });
});

export const jobSeekerDeleteApplication = catchAsyncError(async(req,res,next)=>{
    const {role} = req.user;

    if(role==="Employer"){
        return next(new ErrorHandler("Employer is not allowed to access this resource",400))
    }

    const {id} = req.params;

    const application = await Application.findById(id)

    if(!application){
        return next(new ErrorHandler("OOPS, application not found!",404))
    }

    await application.deleteOne();

    res.status(200).json({
        success: true,
        message: "Application deleted Successfully!"
    })
})

export const postApplication = catchAsyncError(async(req,res,next)=>{
    const {role} = req.user;

    if(role==="Employer"){
        return next(new ErrorHandler("Employer is not allowed to access this resource",400))
    }

    if(!req.files || Object.keys(req.files).length===0){
        return next(new ErrorHandler("Resume file required!"));
    }

    const {resume} = req.files

    const allowedFormats = ["image/png", "image/jpg", "image/webp", "application/pdf"];

    if(!allowedFormats.includes(resume.mimetype)){
        return next(new ErrorHandler("Invalid File type. Please upload your resume in a PNG, JPG, WEBP, or PDF Format.", 400))
    }

    // Parse PDF plain text on the fly if it is a PDF using Mehmet Kozan's ESM pdf-parse
    let resumeText = "";
    if (resume.mimetype === "application/pdf") {
        try {
            const dataBuffer = fs.readFileSync(resume.tempFilePath);
            const parser = new PDFParse({ data: new Uint8Array(dataBuffer) });
            const parsedData = await parser.getText();
            resumeText = parsedData.text || "";
        } catch (parseError) {
            console.error("Failed to parse PDF resume text:", parseError);
        }
    }

    let cloudinaryResponse;
    try {
        cloudinaryResponse = await cloudinary.uploader.upload(
            resume.tempFilePath,
            { resource_type: "auto" }
        );
    } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
        if (fs.existsSync(resume.tempFilePath)) {
            fs.unlinkSync(resume.tempFilePath);
        }
        return next(new ErrorHandler("Failed to upload resume to cloud storage!", 500));
    }

    // Clean up temp file after successful upload
    if (fs.existsSync(resume.tempFilePath)) {
        fs.unlinkSync(resume.tempFilePath);
    }

    if(!cloudinaryResponse || cloudinaryResponse.error){
        console.error("Cloudinary Error: ", cloudinaryResponse.error || "Unknown cloudinary error");
        return next(new ErrorHandler("Failed to upload resume!",500));
    }

    const {name,email,coverLetter,phone,address,jobId} = req.body;

    const applicantID = {
        user: req.user._id,
        role: "Job Seeker"
    }
    if(!jobId){
        return next(new ErrorHandler("Job not found", 404))
    }
    
    const jobDetails = await Job.findById(jobId)

    if(!jobDetails){
        return next(new ErrorHandler("Job not found",404))
    }

    const employerID = {
        user: jobDetails.postedBy,
        role: "Employer",
    }

    if(!name || !email || !phone || !applicantID || !employerID || !address || !coverLetter || !resume){
        return next(new ErrorHandler("Please fill all fields!",400));
    }

    const application = await Application.create({
        name,
        email,
        phone,
        applicantID,
        employerID,
        address,
        coverLetter,
        jobId,
        resumeText,
        resume:{
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
        },
    });

    // Send email notifications asynchronously (non-blocking)
    try {
        const employerUser = await User.findById(jobDetails.postedBy);
        
        // Notify Candidate
        sendEmail({
            email: email,
            subject: `Application Submitted - ${jobDetails.title}`,
            message: `Dear ${name},\n\nThank you for applying to the "${jobDetails.title}" position at JobZee. We have received your application successfully and it is currently under review.\n\nBest regards,\nThe JobZee Team`
        });

        // Notify Recruiter
        if (employerUser && employerUser.email) {
            sendEmail({
                email: employerUser.email,
                subject: `New Application Received - ${jobDetails.title}`,
                message: `Dear Recruiter,\n\nA new candidate (${name}) has submitted an application for your job posting: "${jobDetails.title}".\n\nYou can log into your dashboard to review their resume and cover letter.\n\nBest regards,\nThe JobZee Team`
            });
        }
    } catch (emailError) {
        console.error("Email notification failed to send:", emailError);
    }

    res.status(200).json({
        success: true,
        message: "Application Submitted!",
        application,
    })
})

export const updateApplicationStatus = catchAsyncError(async(req,res,next)=>{
    const {role} = req.user;

    if(role==="Job Seeker"){
        return next(new ErrorHandler("Job Seeker is not allowed to access this resource",400))
    }

    const {id} = req.params;
    const {status} = req.body;

    if(!status || !["Pending", "Reviewed", "Shortlisted", "Rejected", "Accepted"].includes(status)){
        return next(new ErrorHandler("Please provide a valid status", 400));
    }

    const application = await Application.findById(id).populate("jobId");

    if(!application){
        return next(new ErrorHandler("OOPS, application not found!",404))
    }

    application.status = status;
    await application.save();

    // Send status update email asynchronously (non-blocking)
    try {
        const jobTitle = application.jobId ? application.jobId.title : "the position you applied to";
        sendEmail({
            email: application.email,
            subject: `Application Status Updated: ${jobTitle}`,
            message: `Dear ${application.name},\n\nYour application status for the position "${jobTitle}" has been updated to: ${status}.\n\nLog in to your dashboard to view more details.\n\nBest regards,\nThe JobZee Team`
        });
    } catch (emailError) {
        console.error("Email notification failed to send:", emailError);
    }

    // Emit live WebSocket notification event to candidate
    try {
        const candidateId = application.applicantID.user.toString();
        const jobTitle = application.jobId ? application.jobId.title : "Position";
        emitSocketEvent(candidateId, "statusUpdated", {
            applicationId: application._id,
            jobTitle,
            status,
            message: `Your application status for "${jobTitle}" was updated to: ${status}.`
        });
    } catch (socketError) {
        console.error("Failed to emit WebSocket event:", socketError);
    }

    res.status(200).json({
        success: true,
        message: "Application status updated successfully!",
        application,
    });
});
