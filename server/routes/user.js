import express from "express";
import {
  changePassword,
  forgotPassword,
  getUser,
  loginStatus,
  loginUser,
  logout,
  registerUser,
  resetPassword,
  updateUser,
} from "../controllers/user.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logout);
router.get("/getuser", protect, getUser);
router.get("/loggedin", loginStatus);
router.patch("/updateuser", protect, updateUser);
router.patch("/changepassword", protect, changePassword);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resetToken", resetPassword);

export default router;
