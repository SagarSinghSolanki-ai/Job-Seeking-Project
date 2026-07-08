import { GoogleGenerativeAI } from "@google/generative-ai";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Application } from "../models/applicationSchema.js";
import { Job } from "../models/jobSchema.js";
import fs from "fs";
import { PDFParse } from "pdf-parse";

const isGeminiConfigured = () => {
  return process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MOCK_KEY" && process.env.GEMINI_API_KEY.trim() !== "";
};

const getGeminiResponse = async (prompt) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
};

export const parseResume = catchAsyncError(async (req, res, next) => {
  let textToParse = "";

  if (req.files && req.files.resume) {
    const resume = req.files.resume;
    if (resume.mimetype !== "application/pdf") {
      return next(new ErrorHandler("Only PDF resume files are supported for auto-fill!", 400));
    }
    try {
      const dataBuffer = fs.readFileSync(resume.tempFilePath);
      const parser = new PDFParse({ data: new Uint8Array(dataBuffer) });
      const parsedData = await parser.getText();
      textToParse = parsedData.text || "";
      console.log(`[Resume Parse Diagnostic] Extracted text length: ${textToParse.trim().length} chars`);
      if (textToParse.trim().length === 0) {
        console.warn("[Resume Parse Diagnostic] Warning: Extracted text is empty! This PDF is likely a scanned image/photo and lacks a selectable text layer.");
      }
      if (fs.existsSync(resume.tempFilePath)) {
        fs.unlinkSync(resume.tempFilePath);
      }
    } catch (parseError) {
      if (fs.existsSync(resume.tempFilePath)) {
        fs.unlinkSync(resume.tempFilePath);
      }
      return next(new ErrorHandler("Failed to extract text from resume PDF!", 500));
    }
  } else if (req.body.text) {
    textToParse = req.body.text;
  } else {
    return next(new ErrorHandler("Please upload a PDF resume file or provide resume text!", 400));
  }

  if (textToParse.trim().length < 50) {
    return res.status(200).json({
      success: true,
      isScanned: true,
      message: "This PDF has no readable text layer (likely scanned). Please upload a digital PDF or fill the fields manually."
    });
  }

  const mockData = {
    success: true,
    isMock: true,
    data: {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "1234567890",
      address: "New York, USA",
      coverLetter: "I am highly motivated to apply for this job. I have 3 years of experience in JavaScript and web development, specializing in React and Node.js. [DEMO MODE: Configure a valid GEMINI_API_KEY in config.env to generate personalized details]"
    }
  };

  if (!isGeminiConfigured()) {
    return res.status(200).json(mockData);
  }

  try {
    const prompt = `
      You are an expert ATS recruitment assistant. 
      Analyze the following resume text and extract these fields: Name, Email, Phone, Address (City/Country), and a brief, professional 3-sentence Cover Letter template suited for general web development or their primary skill.
      
      Format the output ONLY as a valid, parsable JSON object matching this schema exactly. Do not include markdown code block syntax (like \`\`\`json).
      
      {
        "name": "string or empty",
        "email": "string or empty",
        "phone": "string or empty",
        "address": "string or empty",
        "coverLetter": "string or empty"
      }
      
      Resume text:
      ${textToParse}
    `;

    const rawResponse = await getGeminiResponse(prompt);
    const cleanJSON = rawResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    const data = JSON.parse(cleanJSON);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Gemini API Error (falling back to mock parser):", error.message);
    res.status(200).json(mockData);
  }
});

export const generateCoverLetter = catchAsyncError(async (req, res, next) => {
  const { jobDescription, candidateProfile } = req.body;

  if (!jobDescription) {
    return next(new ErrorHandler("Job description is required to generate cover letter!", 400));
  }

  const mockResponse = {
    success: true,
    isMock: true,
    coverLetter: `Dear Hiring Manager,\n\nI am writing to express my enthusiastic interest in this position. Based on my background in React, Node.js, and modern fullstack development, I am confident that I can add value to your team. \n\nI look forward to discussing how my experience fits your requirements.\n\n[DEMO MODE: Set a valid GEMINI_API_KEY in config.env to get custom AI letters].\n\nSincerely,\nApplicant`
  };

  if (!isGeminiConfigured()) {
    return res.status(200).json(mockResponse);
  }

  try {
    const prompt = `
      Write a professional, engaging cover letter for a candidate applying to a job based on:
      Job Description:
      ${jobDescription}

      Candidate Details / Bio:
      ${candidateProfile || "General developer with standard coding skills."}

      Write it in first-person, keep it under 250 words, and leave placeholders like [Your Name] or [Company Name] where appropriate.
    `;

    const coverLetter = await getGeminiResponse(prompt);
    res.status(200).json({
      success: true,
      coverLetter,
    });
  } catch (error) {
    console.error("Gemini API Error (falling back to mock cover letter):", error.message);
    res.status(200).json(mockResponse);
  }
});

export const checkATSScore = catchAsyncError(async (req, res, next) => {
  const { applicationId } = req.body;

  if (!applicationId) {
    return next(new ErrorHandler("Application ID is required to score ATS match!", 400));
  }

  const application = await Application.findById(applicationId).populate("jobId");

  if (!application) {
    return next(new ErrorHandler("Application not found!", 404));
  }

  const resumeText = application.resumeText || "";
  const jobDescription = application.jobId ? application.jobId.description : "";

  if (!resumeText) {
    return next(new ErrorHandler("No raw text available in application resume. Scoring only works on PDF resume uploads!", 400));
  }

  const mockResponse = {
    success: true,
    isMock: true,
    data: {
      score: 78,
      matchedKeywords: ["React", "Express", "Node.js", "MongoDB", "JavaScript"],
      missingKeywords: ["TypeScript", "CI/CD", "Docker", "Unit Testing"],
      feedback: "[DEMO MODE: Set a valid GEMINI_API_KEY in config.env to activate live AI analysis] The candidate has a solid technical foundation, but lacks testing and DevOps keywords found in the job description. Recommend adding experience in Docker and Jest."
    }
  };

  if (!isGeminiConfigured()) {
    return res.status(200).json(mockResponse);
  }

  try {
    const prompt = `
      Analyze this candidate's resume text against this job description.
      Output ONLY a valid, parsable JSON object. Do not include markdown code block syntax (like \`\`\`json).
      
      {
        "score": 0 to 100 representing match percentage (number),
        "matchedKeywords": ["array of matching key terms and technologies"],
        "missingKeywords": ["important technologies or keywords from the job description missing from the resume"],
        "feedback": "a short 3-sentence summary of advice for the candidate to improve their match rate"
      }

      Job Description:
      ${jobDescription}

      Resume Text:
      ${resumeText}
    `;

    const rawResponse = await getGeminiResponse(prompt);
    const cleanJSON = rawResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    const data = JSON.parse(cleanJSON);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Gemini API Error (falling back to mock ATS scanner):", error.message);
    res.status(200).json(mockResponse);
  }
});
