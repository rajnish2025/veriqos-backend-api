import { Router } from "express";
import {
  getAllUsers,
  registerUser,
  getUserById,
  updateUser,
  deleteUser,
  updateProfilePic,
  logIn,
  sendOTPtoUser,
  verifyOTPtoUser,
  forgotPassword,
  resetPasswordLink,
  resetPassword,
} from "../../controllers/users/user.controllers.js";
import upload from "../../utilities/fileStorage.js";
import Auth from "../../middlewares/auth.middlewares.js";

const router = Router();

router.route("/all").get(getAllUsers);
router.route("/:id").get(getUserById);
router.route("/signup").post(registerUser);
router.route("/update/:id").patch(Auth, updateUser);
router.route("/delete/:id").delete(Auth, deleteUser);
router
  .route("/:id/profile-pic")
  .patch(Auth, upload.single("profilePic"), updateProfilePic);
router.route("/login").post(logIn);
router.route("/sendOTP/:id").post(sendOTPtoUser);
router.route("/verifyOTP/:id").post(verifyOTPtoUser);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password_link/:id").post(resetPasswordLink);
router.route("/reset-password").patch(resetPassword);

export default router;
