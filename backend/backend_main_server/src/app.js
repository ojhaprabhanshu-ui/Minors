import authroutes from "./routes/auth.routes.js"
import express from "express"
import cookieparser from "cookie-parser"
import dotenv from "dotenv"
dotenv.config()
import cors from "cors"


const app = express()

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000", "http://localhost:5174"], 
    credentials: true,
  })
);
app.use(express.json())
app.use(cookieparser())
app.use("/api/auth" , authroutes)


export default app;