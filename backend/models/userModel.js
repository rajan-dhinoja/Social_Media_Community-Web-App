import mongoose, { Schema } from "mongoose";

//schema
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First Name is Required!"],
    },
    lastName: {
      type: String,
      required: [true, "Last Name is Required!"],
    },
    email: {
      type: String,
      required: [true, " Email is Required!"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is Required!"],
      minlength: [6, "Password length should be greater than 6 character"],
      select: true,
    },
    location: { type: String },
    profileImg: { type: String },
    profession: { type: String },
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
    views: [{ type: String }],
    verified: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    role: { type: String, default: "Regular User" },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
