import { ObjectId } from "mongodb";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Job } from "../models/jobSchema.js";
import { getCache, setCache, clearJobsCache } from "../utils/redis.js";

export const getAllJobs = catchAsyncError(async(req,res,next)=>{
    const { category, city, country, search } = req.query;
    const query = { expired: false };

    if (category) {
        query.category = category;
    }
    if (city) {
        query.city = { $regex: city, $options: "i" };
    }
    if (country) {
        query.country = { $regex: country, $options: "i" };
    }
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } }
        ];
    }

    // Redis Caching check
    const cacheKey = `jobs:all:${category || ""}:${city || ""}:${country || ""}:${search || ""}`;
    const cachedJobs = await getCache(cacheKey);

    if (cachedJobs) {
        return res.status(200).json({
            success: true,
            jobs: cachedJobs,
            fromCache: true,
        });
    }

    const jobs = await Job.find(query);
    
    // Save to Redis cache (5 minutes expiration)
    await setCache(cacheKey, jobs, 300);

    res.status(200).json({
        success: true,
        jobs,
    });
});

export const postJob = catchAsyncError(async(req,res,next)=>{
    const {role} = req.user
    if(role==="Job Seeker"){
        return next(new ErrorHandler("Job Seeker is not allowed to access these resources",400))
    }

    const {title,description,category,country,city,location,salaryFrom,salaryTo,fixedSalary} = req.body;

    if(!title || !description || !category || !country || !city || !location){
        return next(new ErrorHandler("Please provide full details!",400))
    }

    if((!salaryFrom || !salaryTo) && !fixedSalary){
        return next(new ErrorHandler("Please provide fixed salary or ranged salary!"))
    }

    if(salaryFrom && salaryTo && fixedSalary){
        return next(new ErrorHandler("Cannot enter both fixed salary and ranged salary"))
    }

    const postedBy = req.user._id;

    const job = await Job.create({
        title,
        description,
        category,
        country,
        city,
        location,
        salaryFrom,
        salaryTo,
        fixedSalary,
        postedBy,
    });

    // Invalidate stale job listing caches
    await clearJobsCache();

    res.status(200).json({
        success: true,
        message: "Job posted successfully!"
    });
});

export const getmyJobs = catchAsyncError(async(req,res,next)=>{
    const {role} = req.user;
    if(role==="Job Seeker"){
        return next(new ErrorHandler("Job Seeker is not allowed to access these resources",400))
    }

    const myjobs = await Job.find({postedBy:req.user._id});

    res.status(200).json({
        success:true,
        myjobs,
        myJobs: myjobs,
    });
});

export const updateJob = catchAsyncError(async(req,res,next)=>{
    const {role} = req.user;
    if(role==="Job Seeker"){
        return next(new ErrorHandler("Job Seeker is not allowed to access these resources",400))
    }

    const {id} = req.params;

    let job = await Job.findById(id);

    if(!job){
        return next(new ErrorHandler("OOPS, job not found!",404))
    }

    job = await Job.findByIdAndUpdate(id,req.body,{
        new: true,
        runValidators: true,
        useFindAndModify: false,
    })

    // Invalidate stale job listing caches
    await clearJobsCache();

    res.status(200).json({
        success:true,
        job,
        message: "Job Updated Successfully!"
    });
});

export const deleteJob = catchAsyncError(async(req,res,next)=>{
    const {role} = req.user;
    if(role==="Job Seeker"){
        return next(new ErrorHandler("Job Seeker is not allowed to access these resources",400))
    }

    const {id} = req.params;

    let job = await Job.findById(id);

    if(!job){
        return next(new ErrorHandler("OOPS, job not found!",404))
    }

    await job.deleteOne();

    // Invalidate stale job listing caches
    await clearJobsCache();

    res.status(200).json({
        success:true,
        message:"Job Deleted Successfully!"
    });
});

export const getSingleJob = catchAsyncError(async(req,res,next)=>{
    const {id} = req.params;
    try{
        const job = await Job.findById(id);

        if(!job){
            return next(new ErrorHandler("Job not found",404))
        }

        res.status(200).json({
            success: true,
            job,
        })
    } catch(error){
        return next(new ErrorHandler("Invalid Id/ CastError",400));
    }
})