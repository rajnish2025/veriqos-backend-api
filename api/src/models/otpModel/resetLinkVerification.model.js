import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ResetLinkVerificationSchema = new Schema(
  {
    token: {
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

const ResetLinkVerification = mongoose.model(
  "ResetLinkVerification",
  ResetLinkVerificationSchema
);

export default ResetLinkVerification;
