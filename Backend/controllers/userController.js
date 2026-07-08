import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import { Job } from "../models/jobSchema.js";
import { sendToken } from "../utils/jwtToken.js";

export const register = catchAsyncError(async(req,res,next) =>  {
    const {name,email,phone,role,password} = req.body;
    if(!name||!email||!phone||!role||!password){
        return next(new ErrorHandler("Please fill full registration form!", 400));
    }
    if (password.length < 8 || password.length > 32) {
        return next(new ErrorHandler("Password must be between 8 and 32 characters!", 400));
    }
    const isEmail = await User.findOne({email})
    if(isEmail){
        return next(new ErrorHandler("Email already exists!", 400))
    }

    const user = await User.create({
        name,
        email,
        phone,
        role,
        password
    })
    
    sendToken(user,200,res,"User registered Successfully!");
})

export const login = catchAsyncError(async(req,res,next)=>{
    const {password,role,email} = req.body;

    if(!email||!password||!role){
        return next(new ErrorHandler("Please provide email,role and password",400))
    }
    const user = await User.findOne({email}).select("+password");

    if(!user){
        return next(new ErrorHandler("Invalid Password or Email",400))
    }
    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        return next (new ErrorHandler("Invalid Email or Password",400));
    }

    if(user.role !== role){
        return next (new ErrorHandler("User with this role not found",400))
    }

    sendToken(user,200,res,"User logged in successfully!");
})

export const logout = catchAsyncError(async(req,res,next)=>{
    res.status(201)
    .cookie("token","",{
        httpOnly:true,
        expires: new Date(Date.now()),
    })
    .json({
        success: true,
        message: "User Logged Out Successfully",
    })
})

export const getUser = catchAsyncError((req,res,next)=>{
    res.status(200).json({
        success: true,
        user: req.user,
    });
});

export const toggleBookmarkJob = catchAsyncError(async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
        return next(new ErrorHandler("Employer is not allowed to bookmark jobs!", 400));
    }
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) {
        return next(new ErrorHandler("Job not found!", 404));
    }
    const user = await User.findById(req.user._id);
    const isBookmarked = user.savedJobs.includes(jobId);
    if (isBookmarked) {
        user.savedJobs = user.savedJobs.filter((id) => id.toString() !== jobId);
        await user.save();
        res.status(200).json({
            success: true,
            message: "Job removed from saved jobs!",
            isBookmarked: false,
        });
    } else {
        user.savedJobs.push(jobId);
        await user.save();
        res.status(200).json({
            success: true,
            message: "Job saved successfully!",
            isBookmarked: true,
        });
    }
});

export const getBookmarkedJobs = catchAsyncError(async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
        return next(new ErrorHandler("Employer is not allowed to access this resource", 400));
    }
    const user = await User.findById(req.user._id).populate("savedJobs");
    res.status(200).json({
        success: true,
        bookmarks: user.savedJobs,
    });
});
