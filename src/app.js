import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

export const app = express();

app.use(
  cors({
    origin: process.env.CROSS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes Import
import userRouter from "./routes/user.routes.js";

// routes Declarations
app.use("/api/v1/users", userRouter);
