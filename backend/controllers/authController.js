import User from "../models/userModel.js";
import { compareString, createJWT, hashString } from "../utils/index.js";
import { sendVerificationEmail } from "../utils/sendEmail.js";

export const register = async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  // validate fields 
  if (!firstName || !lastName || !email || !password) {
    next("Provide Required Fields!");
    return;
  }

  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      next("Email Address already exists");
      return;
    }

    const hashedPassword = await hashString(password);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    //send email verification to user
    sendVerificationEmail(user, res);
    res.status(200).json({ message: "User Created Successfully...", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message, error: error });
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    //validation
    if (!email || !password) {
      next("Please Provide User Credentials");
      return;
    }

    // find user by email
    const user = await User.findOne({ email }).select("+password").populate({
      path: "friends",
      select: "firstName lastName location profileImg -password",
    });

    if (!user) {
      next("User not Found...");
      return;
    }

    // compare password
    const isMatch = await compareString(password, user?.password);

    if (!isMatch) {
      next("Invalid email or password");
      return;
    }

    user.password = undefined;

    const token = createJWT(user?._id);

    res.status(201).json({
      success: true,
      message: "Login successfully",
      user,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message, error: error });
  }
};
