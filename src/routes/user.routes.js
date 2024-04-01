import { Router } from "express";
import {
  loginUser,
  registerUser,
  logout,
} from "../controllers/user.controller.js";
import { multerUpload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Register User
router
  .route("/register")
  .post(multerUpload.fields([{ name: "avatar", maxCount: 1 }]), registerUser);

// Login User
router.route("/login").post(loginUser);

// Secured Route
router.route("/logout").post(verifyJWT, logout);

export default router;
