import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Interview } from "../models/interviewSchema.js";
import { Job } from "../models/jobSchema.js";
import { User } from "../models/userSchema.js";
import { sendEmail } from "../utils/sendEmail.js";
import { emitSocketEvent } from "../utils/socket.js";

export const scheduleInterview = catchAsyncError(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(new ErrorHandler("Job Seekers are not allowed to schedule interviews!", 400));
  }

  const { applicantId, jobId, date, time, meetingLink, notes } = req.body;

  if (!applicantId || !jobId || !date || !time) {
    return next(new ErrorHandler("Please fill in all required scheduling details!", 400));
  }

  const candidate = await User.findById(applicantId);
  if (!candidate) {
    return next(new ErrorHandler("Candidate user not found!", 404));
  }

  const job = await Job.findById(jobId);
  if (!job) {
    return next(new ErrorHandler("Job not found!", 404));
  }

  const employerId = req.user._id;

  const interview = await Interview.create({
    applicantId,
    employerId,
    jobId,
    date,
    time,
    meetingLink: meetingLink || "https://meet.google.com/abc-defg-hij",
    notes,
    status: "Pending"
  });

  // Notify Candidate via email
  try {
    sendEmail({
      email: candidate.email,
      subject: `Interview Invitation - ${job.title}`,
      message: `Dear ${candidate.name},\n\nYou have been invited to an interview for the "${job.title}" position at JobZee.\n\nDate: ${date}\nTime: ${time}\nMeeting Link: ${interview.meetingLink}\n\nNotes: ${notes || "No special instructions provided."}\n\nPlease log in to your dashboard to accept or decline the interview slots.\n\nBest regards,\nThe JobZee Team`
    });
  } catch (emailError) {
    console.error("Email notification failed to send:", emailError);
  }

  // Emit WebSockets notification
  try {
    emitSocketEvent(applicantId.toString(), "interviewScheduled", {
      interviewId: interview._id,
      jobTitle: job.title,
      date,
      time,
      meetingLink: interview.meetingLink,
      message: `You have a new interview scheduled for "${job.title}" on ${date} at ${time}.`
    });
  } catch (socketError) {
    console.error("Socket notification error:", socketError);
  }

  res.status(200).json({
    success: true,
    message: "Interview scheduled successfully!",
    interview
  });
});

export const getUserInterviews = catchAsyncError(async (req, res, next) => {
  const { role, _id } = req.user;
  let query = {};

  if (role === "Employer") {
    query = { employerId: _id };
  } else {
    query = { applicantId: _id };
  }

  const interviews = await Interview.find(query)
    .populate("applicantId", "name email phone")
    .populate("employerId", "name email phone")
    .populate("jobId", "title category");

  res.status(200).json({
    success: true,
    interviews
  });
});

export const updateInterviewStatus = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !["Accepted", "Rejected", "Cancelled"].includes(status)) {
    return next(new ErrorHandler("Please provide a valid interview status!", 400));
  }

  const interview = await Interview.findById(id)
    .populate("jobId", "title")
    .populate("applicantId", "name email")
    .populate("employerId", "name email");

  if (!interview) {
    return next(new ErrorHandler("Interview booking not found!", 404));
  }

  // Permission checks
  const userIdStr = req.user._id.toString();
  if (interview.applicantId._id.toString() !== userIdStr && interview.employerId._id.toString() !== userIdStr) {
    return next(new ErrorHandler("Unauthorized to update this interview!", 403));
  }

  interview.status = status;
  await interview.save();

  const jobTitle = interview.jobId ? interview.jobId.title : "the position";

  // Notify other party via email
  try {
    const notifyEmail = req.user.role === "Employer" ? interview.applicantId.email : interview.employerId.email;
    const recipientName = req.user.role === "Employer" ? interview.applicantId.name : interview.employerId.name;
    const actorName = req.user.name;

    sendEmail({
      email: notifyEmail,
      subject: `Interview Status Changed: ${jobTitle}`,
      message: `Dear ${recipientName},\n\nYour interview for "${jobTitle}" has been marked as ${status} by ${actorName}.\n\nDate: ${interview.date}\nTime: ${interview.time}\n\nBest regards,\nThe JobZee Team`
    });
  } catch (emailError) {
    console.error("Email notification failed to send:", emailError);
  }

  // Emit WebSocket alerts
  try {
    const notifyId = req.user.role === "Employer" ? interview.applicantId._id.toString() : interview.employerId._id.toString();
    emitSocketEvent(notifyId, "interviewStatusUpdated", {
      interviewId: interview._id,
      jobTitle,
      status,
      message: `Interview for "${jobTitle}" was marked as ${status}.`
    });
  } catch (socketError) {
    console.error("Socket notification error:", socketError);
  }

  res.status(200).json({
    success: true,
    message: `Interview status marked as ${status} successfully!`,
    interview
  });
});
