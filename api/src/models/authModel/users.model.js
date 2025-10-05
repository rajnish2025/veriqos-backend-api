import mongoose from "mongoose";
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // Exclude password from queries by default
    },
    phone: {
      type: String,
      required: false,
      unique: true,
      trim: true,
    },
    company_name: {
      type: String,
      trim: true,
    },
    designation: {
      type: String,
      required: false,
    },
    profile_pic: {
      type: {
        _id: false,
        url: String,
        filename: String,
      },
      default: {
        url: "https://via.placeholder.com/250x250.png",
        filename: "myprofile",
      },
    },
    loginNotification: {
      type: Boolean,
      default: true,
    },
    emailNotification: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", UserSchema);

export default User;
