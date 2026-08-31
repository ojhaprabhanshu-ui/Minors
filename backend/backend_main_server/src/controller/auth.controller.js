import mongoose from "mongoose";
import express from "express";
import UserModel from "../models/usermodel.js";
import { sendfiles } from "../services/storage.services.js";
import { generateToken } from "../utils/token.js";

export const registerController = async (req, res) => {
  try {
    const { fullname, email, password, phone } = req.body;
    if (!fullname || !email || !password || !phone) {
      return res.status(400).json({
        succces: false,
        message: "all the details are required",
      });
    }
    const newUser = await UserModel.create({
      fullname,
      email,
      password,
      phone,
    });

    const refreshToken = generateToken(newUser._id, "7d");
    const accessToken = generateToken(newUser._id, "30min");

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 30 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userObj = newUser.toObject();
    delete userObj.password;

    res.status(201).json({
      success: true,
      message: "user created successfully",
      data: userObj,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "internal server error during signup",
      error: error.message || error,
    });
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "all the details are required",
      });
    }

    const isExisted = await UserModel.findOne({ email: email }).select(
      "+password",
    );

    if (!isExisted) {
      return res.status(400).json({
        success: false,
        message: "user not found",
      });
    }
    const checkPass = await isExisted.comparePass(password);

    if (!checkPass) {
      return res.status(401).json({
        success: false,
        message: "invalid credentials",
      });
    }
    const refreshToken = generateToken(isExisted._id, "7d");
    const accessToken = generateToken(isExisted._id, "30min");

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 30 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userObj = isExisted.toObject();
    delete userObj.password;
    return res.status(200).json({
      success: true,
      message: "loggedin successfully",
      data: userObj,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "internal server error during login",
      error: error.message || error,
    });
  }
};


export const logoutController = async (req, res)=>{
  try {
    
    
  } catch (error) {
     res.status(500).json({
      success: false,
      message: "internal server error during login",
      error: error.message || error,
    });
  }
}
