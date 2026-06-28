import express from "express";
import {
  getCurrentUser,
  loginUser,
  registerUser,
  updatePassword,
  updateProfile,
} from "../controllers/userContoller.js";
import authMiddleware from "../middleware/auth.js";

const userRouter = express.Router();

//PUBLIC LINKS
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

//PRIVATE LINKS
userRouter.get("/me", authMiddleware, getCurrentUser);
userRouter.get("/profile", authMiddleware, updateProfile);
userRouter.get("/password", authMiddleware, updatePassword);

export default userRouter;
