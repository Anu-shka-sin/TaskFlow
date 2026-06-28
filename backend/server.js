import express from "express";
import cors from "cors";
import "dotenv/config";
import { connectDB } from "./config/db.js";
import userRouter from "./routes/userRoute.js";
import taskRouter from "./routes/taskRoute.js";

import dotenv from "dotenv";
dotenv.config();
console.log(process.env.JWT_SECRET);

const app = express();
const port = process.env.PORT || 4000;

//MIDDLEWERE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//DB connect
connectDB();

//Routes
app.use("/api/user", userRouter);
app.use("/api/tasks", taskRouter);

app.get("/", (req, res) => {
  res.send("API WORKING");
});

app.listen(port, () => {
  console.log(`Server Started on http://localhost:${port}`);
  
});
