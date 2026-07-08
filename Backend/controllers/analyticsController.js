import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Job } from "../models/jobSchema.js";
import { Application } from "../models/applicationSchema.js";

export const getEmployerAnalytics = catchAsyncError(async (req, res, next) => {
  const { role } = req.user;

  if (role === "Job Seeker") {
    return next(new ErrorHandler("Job Seekers cannot view the analytics dashboard!", 400));
  }

  const userId = req.user._id;

  // 1. Core counters
  const totalJobs = await Job.countDocuments({ postedBy: userId });
  const activeJobs = await Job.countDocuments({ postedBy: userId, expired: false });
  const totalApplications = await Application.countDocuments({ "employerID.user": userId });

  // 2. Applications by status breakdown
  const statusCounts = await Application.aggregate([
    { $match: { "employerID.user": userId } },
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);

  // Convert array results into key-value map for easy consumption
  const statusBreakdown = {
    Pending: 0,
    Reviewed: 0,
    Shortlisted: 0,
    Rejected: 0,
    Accepted: 0,
  };
  statusCounts.forEach((item) => {
    const key = item._id || "Pending";
    if (statusBreakdown.hasOwnProperty(key)) {
      statusBreakdown[key] = item.count;
    }
  });

  // 3. Category distribution of jobs posted
  const categoryCounts = await Job.aggregate([
    { $match: { postedBy: userId } },
    { $group: { _id: "$category", count: { $sum: 1 } } }
  ]);

  // 4. Monthly application trend (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const monthlyCounts = await Application.aggregate([
    {
      $match: {
        "employerID.user": userId,
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyTrend = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const label = `${monthNames[d.getMonth()]} ${year}`;

    const match = monthlyCounts.find((item) => item._id.month === month && item._id.year === year);
    monthlyTrend.push({
      month: label,
      applications: match ? match.count : 0
    });
  }

  res.status(200).json({
    success: true,
    data: {
      counters: {
        totalJobs,
        activeJobs,
        totalApplications,
      },
      statusBreakdown,
      categoryDistribution: categoryCounts.map(item => ({ name: item._id, count: item.count })),
      monthlyTrend,
    }
  });
});
