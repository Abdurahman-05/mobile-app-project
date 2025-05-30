import express from "express";
import prisma from "../prisma/client.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import AppError from "../utils/appError.js";





const registerController = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    const duplicateUser = await prisma.user.findUnique({ where: { email } });

    if (duplicateUser) {
      return next(new AppError("User already exists with this email", 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    const accessToken = jwt.sign(
      {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
      process.env.ACCESS_TOKEN
    );

    return res
      .status(201)
      .json({ accessToken, message: "User registered successfully" });
  } catch (error) {
    return next(error); 
  }
};


const loginController = async (req, res,next) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return next(new AppError("User not registered", 400));
  }

  try {
    const check_password = await bcrypt.compare(password, user.password);
    if (!check_password) {
      return next(new AppError("Incorrect password", 400));
    }
    const accessToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      process.env.ACCESS_TOKEN
    );

    return res.json({ accessToken, message: "Login successful" });
  } catch (error) {
    return next(error);
  }
};


const logoutController = async (req, res,next) => {};

const authController = {
  registerController,
  loginController,
  logoutController,
};

export default authController;
