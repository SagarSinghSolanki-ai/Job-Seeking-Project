import mongoose from "mongoose";

const jobSchema = mongoose.Schema({
    title:{
        type:String,
        required: [true, "Please provide job title"],
        minLength: [3, "Job title must contain 3 characteres!"],
        maxLength: [50, "Job title must not exceed 50 characters!"],
    },
    description:{
        type: String,
        required: [true, "Please provide job description"],
        minLength: [50, "description must contain 50 characteres!"],
        maxLength: [350, "description must not exceed 350 characters!"],
    },
    category:{
        type:String,
        required: [true, "Job category is required"],
    },
    country:{
        type:String,
        required: [true, "Job country is required"],
    },
    city:{
        type:String,
        required: [true, "Job city is required"],
    },
    location:{
        type:String,
        required: [true, "Please provide exact location"],
        minLength: [3, "Job location must contain at least 3 characters!"],
    },
    fixedSalary:{
        type:Number,
        min: [1000, "Fixed salary must contain at least 4 digits"],
        max: [999999999, "Fixed salary must not exceed 9 digits"],
    },
    salaryFrom:{
        type:Number,
        min: [1000, "Salary From must contain at least 4 digits"],
        max: [999999999, "Salary From must not exceed 9 digits"],
    },
    salaryTo:{
        type:Number,
        min: [1000, "Salary To must contain at least 4 digits"],
        max: [999999999, "Salary To must not exceed 9 digits"],
    },
    expired:{
        type:Boolean,
        default: false
    },
    jobPostedOn:{
        type:Date,
        default:Date.now()
    },
    postedBy:{
        type:mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    }
})

export const Job = mongoose.model("Job", jobSchema);