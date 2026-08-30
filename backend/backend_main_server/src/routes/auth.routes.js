import UserModel from "../models/usermodel.js";
import {
  registerController,
  loginController,
} from "../controller/auth.controller.js";
import upload from "../config/multer.js";

import express from "express";

const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);

export default router;
