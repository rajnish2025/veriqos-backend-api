import mongoose from "mongoose";
const Schema = mongoose.Schema;

const OTPSchema = new Schema(
  {
    otp: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    expireTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const OTP = mongoose.model("OTP", OTPSchema);

export default OTP;
