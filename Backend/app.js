import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import applicationRouter from "./routes/applicationRouter.js"
import jobRouter from "./routes/jobRouter.js"
import userRouter from "./routes/userRouter.js"
import analyticsRouter from "./routes/analyticsRouter.js"
import aiRouter from "./routes/aiRouter.js"
import interviewRouter from "./routes/interviewRouter.js"
import {dbConnection} from "./database/dbConnection.js"
import { errorMiddleware } from "./middlewares/error.js";

const app = express();
dotenv.config({path: "./config/config.env"})

app.use(cors({
    origin:[process.env.FRONTEND_URL],
    methods:["GET","PUT","POST","DELETE"],
    credentials:true,
}))

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:"/tmp/"
}))

app.use("/api/v1/user", userRouter)
app.use("/api/v1/application", applicationRouter)
app.use("/api/v1/job", jobRouter)
app.use("/api/v1/analytics", analyticsRouter)
app.use("/api/v1/ai", aiRouter)
app.use("/api/v1/interview", interviewRouter)

dbConnection();

app.use(errorMiddleware)

export default app;