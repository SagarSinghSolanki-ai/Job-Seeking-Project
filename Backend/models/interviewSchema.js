import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema({
  applicantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  meetingLink: {
    type: String,
    default: "https://meet.google.com/mock-link",
  },
  status: {
    type: String,
    enum: ["Pending", "Accepted", "Rejected", "Cancelled"],
    default: "Pending",
  },
  notes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Interview = mongoose.model("Interview", interviewSchema);
