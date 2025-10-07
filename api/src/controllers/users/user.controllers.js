import User from "../../models/authModel/users.model.js";
import ApiResponse from "../../utilities/ApiResponse.js";
import asyncHandler from "../../utilities/asyncHandlers.js";
import ApiError from "../../utilities/ApiError.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import OTP from "../../models/otpModel/otp.model.js";
import dotenv from "dotenv";
import path from "path";

import {
  sendPasswordResetOTP,
  sendResetPasswordLinkEmail,
  sendVerificationOTP,
} from "../../config/sendEmail.js";
import ResetLinkVerification from "../../models/otpModel/resetLinkVerification.model.js";
dotenv.config();

function generateShuffledToken(uid) {
  const base = uid;
  const randomPart = Math.random().toString(36).substring(2, 12); // 10-char random
  const timestamp = Date.now().toString();

  const merged = (base + randomPart + timestamp).split("");

  for (let i = merged.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [merged[i], merged[j]] = [merged[j], merged[i]];
  }
  return merged.join("");
}

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const userData = await User.find({}, { password: 0 });
    if (!userData) {
      return res
        .status(404)
        .json(new ApiError(404, { message: "No users found" }));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { message: "All users fetched successfully" },
          userData
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiError(
          500,
          { message: "Error fetching users" },
          error.message || error
        )
      );
  }
});

const registerUser = asyncHandler(async (req, res) => {
  try {
    const bodyData = req.body;
    console.log(bodyData);
    if (!bodyData) {
      return res
        .status(400)
        .json(new ApiError(400, { message: "Invalid user data" }));
    }
    const validUser = await User.findOne({ email: bodyData.email });
    console.log(validUser);
    if (validUser) {
      return res
        .status(200)
        .json(
          new ApiResponse(409, { message: "User with this email already exit" })
        );
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(bodyData.password, salt);
    const userData = await User.create({ ...bodyData, password: hash });
    if (!userData) {
      return res
        .status(400)
        .json(new ApiError(400, { message: "User creation failed" }));
    }
    return res
      .status(201)
      .json(
        new ApiResponse(201, { message: "User created successfully" }, userData)
      );
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiError(
          500,
          { message: "Error creating user" },
          error.message || error
        )
      );
  }
});

const getUserById = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.id;
    const userData = await User.findById(userId, { password: 0 });
    if (!userData) {
      return res
        .status(404)
        .json(new ApiError(404, { message: "User not found" }));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, { message: "User fetched successfully" }, userData)
      );
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiError(
          500,
          { message: "Error fetching user" },
          error.message || error
        )
      );
  }
});

const updateUser = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.id;
    if (req.userId != userId) {
      return res.status(403).json(new ApiError(403, { message: "Forbidden" }));
    }
    const updateData = req.body;
    console.log(updateData);
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
      select: "-password",
    });
    if (!updatedUser) {
      return res
        .status(404)
        .json(new ApiError(404, { message: "User not found" }));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { message: "User updated successfully" },
          updatedUser
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiError(
          500,
          { message: "Error updating user" },
          error.message || error
        )
      );
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.id;
    if (req.userId != userId) {
      return res.status(403).json(new ApiError(403, { message: "Forbidden" }));
    }
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res
        .status(404)
        .json(new ApiError(404, { message: "User not found" }));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { message: "Your Account deleted successfully" },
          deletedUser
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiError(
          500,
          { message: "Error deleting account" },
          error.message || error
        )
      );
  }
});

const logIn = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    if (!email || !password) {
      return res
        .status(400)
        .json(
          new ApiError(400, { message: "email and password are required" })
        );
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(200)
        .json(new ApiResponse(404, { message: "User not found" }));
    }

    let isMatched = await bcrypt.compare(password, user.password);
    console.log(isMatched);
    if (isMatched === false) {
      return res
        .status(401)
        .json(new ApiResponse(401, { message: "Invalid credentials" }));
    }
    const token = jwt.sign(
      {
        data: user.id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    return res
      .status(200)
      .json(
        new ApiResponse(200, { message: "Login successful" }, { user, token })
      );
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiError(
          500,
          { message: "Error logging in" },
          error.message || error
        )
      );
  }
});

const updateProfilePic = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const profilePic = req.file.path;
  console.log(profilePic,req.file);
  if (req.userId != userId) {
    return res.status(403).json(new ApiError(403, { message: "Forbidden" }));
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic },
      { new: true }
    );
    if (!updatedUser) {
      return res
        .status(404)
        .json(new ApiError(404, { message: "User not found" }));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { message: "Profile picture updated successfully" },
          updatedUser
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiError(
          500,
          { message: "Error updating profile picture" },
          error.message || error
        )
      );
  }
});

const sendOTPtoUser = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.id;
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expireTime = Date.now() + 60 * 10 * 1000;
    await OTP.findOneAndDelete({ userId: userId });
    const result = await (
      await OTP.create({ userId, otp, expireTime })
    ).populate("userId");
    const reslt = await sendVerificationOTP(result.userId.email, result.otp);
    if (reslt) {
      return res
        .status(201)
        .json(
          new ApiResponse(
            201,
            { message: "OTP send Successfully to your mail." },
            result
          )
        );
    } else {
      res
        .status(200)
        .json(new ApiResponse(500, { message: "Sending OTP failed." }, result));
    }
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiError(
          500,
          { message: "Sending OTP failed." },
          error.message || error
        )
      );
  }
});

const verifyOTPtoUser = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.id;
    const otp = req.body.otp;
    const currentTime = Date.now();
    const result = await (
      await OTP.findOne({ userId: userId })
    ).populate("userId");
    console.log(result);
    if (result) {
      if (result.expireTime < currentTime) {
        console.log("its true");
        await OTP.findOneAndDelete({ userId });
        return res
          .status(200)
          .json(
            new ApiResponse(
              200,
              { message: "OTP expired. Please try again." },
              false
            )
          );
      } else if (result.otp === otp) {
        await OTP.findOneAndDelete({ userId });
        return res
          .status(200)
          .json(
            new ApiResponse(
              200,
              { message: "OTP verified Successfully." },
              true
            )
          );
      }
    }
    console.log(result);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { message: "Opps! OTP does not matched." }, false)
      );
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiError(
          500,
          { message: "OTP verification failed." },
          error.message || error
        )
      );
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    const data = await User.findOne({ email });
    if (data) {
      const userId = data._id;
      const otp = Math.floor(100000 + Math.random() * 900000);
      const expireTime = Date.now() + 60 * 10 * 1000;
      await OTP.findOneAndDelete({ userId });
      const otpRes = await (
        await OTP.create({ userId, otp, expireTime })
      ).populate("userId");
      const sendOtpRes = await sendPasswordResetOTP(
        otpRes.userId.email,
        otpRes.otp
      );
      if (sendOtpRes) {
        return res
          .status(200)
          .json(
            new ApiResponse(
              200,
              { message: "OTP send Successfully to your mail." },
              { id: userId, verified: true }
            )
          );
      } else {
        return res
          .status(200)
          .json(
            new ApiResponse(
              500,
              { message: "Sending OTP to your mail failed." },
              sendOtpRes
            )
          );
      }
    } else {
      return res
        .status(200)
        .json(
          new ApiResponse(
            404,
            { message: "user with this email does not exist." },
            false
          )
        );
    }
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiError(
          500,
          { message: "Sending OTP failed." },
          error.message || error
        )
      );
  }
});

const resetPasswordLink = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.id;
    const userData = await User.findById(userId, { password: 0 });
    const token = generateShuffledToken(userId);
    const expireTime = Date.now() + 60 * 10 * 1000;
    const resetUrl = `${process.env.CORS_ORIGIN}/reset-password-confirm/${userId}/${token}`;
    console.log(resetUrl);
    const resetLinkData = await ResetLinkVerification.create({
      userId: userId,
      token: token,
      expireTime: expireTime,
    });
    if (resetLinkData) {
      const result = await sendResetPasswordLinkEmail(userData.email, resetUrl);
      if (result) {
        return res
          .status(200)
          .json(
            new ApiResponse(
              200,
              { message: "reset password link send, please check your mail." },
              true
            )
          );
      } else {
        return res
          .status(200)
          .json(
            new ApiResponse(
              500,
              { message: "sending reset password link failed." },
              true
            )
          );
      }
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { message: "sending reset password failed." },
          false
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiError(
          500,
          { message: "Sending reset password Email failed." },
          error.message || error
        )
      );
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  try {
    const { userId, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const updatedDetails = await User.findByIdAndUpdate(
      userId,
      { password: hash },
      {
        new: true,
        runValidators: true,
        select: "-password",
      }
    );
    await ResetLinkVerification.findOneAndDelete({ userId: userId });
    if (!updatedDetails) {
      return res
        .status(200)
        .json(new ApiError(404, { message: "User not found" }));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { message: "Password reset successfully." },
          updatedDetails
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiError(
          500,
          { message: "Password reset failed." },
          error.message || error
        )
      );
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.userId;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const updatedDetails = await User.findByIdAndUpdate(
      userId,
      { password: hash },
      {
        new: true,
        runValidators: true,
        select: "-password",
      }
    );
    await ResetLinkVerification.findOneAndDelete({ userId: userId });
    if (!updatedDetails) {
      return res
        .status(200)
        .json(new ApiError(404, { message: "User not found" }));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { message: "Password updated successfully." },
          updatedDetails
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiError(
          500,
          { message: "Password reset failed." },
          error.message || error
        )
      );
  }
});

const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const userId = req.userId;
    console.log("userId : ", userId);
    const userData = await User.findById(userId, { password: 0 });
    if (!userData) {
      return res
        .status(404)
        .json(new ApiError(404, { message: "User not found" }, userData));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, { message: "your profile data." }, userData));
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiError(
          500,
          { message: "Error fetching user" },
          error.message || error
        )
      );
  }
});

export {
  getAllUsers,
  registerUser,
  getUserById,
  updateUser,
  deleteUser,
  logIn,
  updateProfilePic,
  sendOTPtoUser,
  verifyOTPtoUser,
  forgotPassword,
  resetPasswordLink,
  resetPassword,
  getUserProfile,
  updatePassword
};
