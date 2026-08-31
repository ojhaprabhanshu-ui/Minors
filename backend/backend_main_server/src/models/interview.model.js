
import mongoose from "mongoose";
import bcrypt , {compare, compareSync} from "bcrypt";

const InterviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
    },
    overallScore: { type: Number, required: true },
    nlpFeedback: { type: String },
    qaHistory: [
      {
        question: String,
        userAnswer: String,
        score: Number,
        feedback: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("interview", InterviewSchema);