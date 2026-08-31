import mongoose from "mongoose";
import bcrypt , {compare, compareSync} from "bcrypt";



const ResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Links directly to the User model
      required: true,
    },
    fileUrl: { type: String, required: true }, 
    fileId: { type: String, required: true },  
    parsedText: { type: String },             
    overallScore: { type: Number, default: 0 },
    feedback: {
      strengths: [String],
      improvements: [String],
    },
  },
  { timestamps: true }
);

export default mongoose.model("resume", ResumeSchema);