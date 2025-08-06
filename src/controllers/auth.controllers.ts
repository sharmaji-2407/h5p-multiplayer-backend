import { Request, Response } from "express";
import User from "../models/User";
import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcrypt";
import config from "../config";

class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // For now, we're comparing plain text passwords
      // In production, you should use bcrypt.compare(password, user.password)
      if (user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
        },
        config.jwt.secret as string,
        { expiresIn: config.jwt.expiresIn } as SignOptions
      );

      // Return user info and token
      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          isActive: user.isActive,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async register(req: Request, res: Response) {
    try {
      const { email, password, id } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      // Create new user
      const user = await User.create({
        id,
        email,
        password, // In production, hash the password: await bcrypt.hash(password, 10)
        isActive: true,
      });

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
        },
        config.jwt.secret as string,
        { expiresIn: config.jwt.expiresIn } as SignOptions
      );

      return res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          id: user.id,
          email: user.email,
          isActive: user.isActive,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
}

export default new AuthController();
