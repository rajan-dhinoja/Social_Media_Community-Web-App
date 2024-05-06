import Verification from "../models/emailVerification.js";
import User from "../models/userModel.js";
import { compareString, createJWT, hashString } from "../utils/index.js";
import { resetPasswordLink } from "../utils/sendEmail.js";
import FriendRequest from "../models/friendRequest.js";
import PasswordReset from "../models/PasswordReset.js";

export const uploadProfile = (req, res) => {
  // Set storage engine
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/profiles");
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + "-" + path.extname(file.originalname));
    },
  });

  // Init upload
  const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
      checkFileType(file, cb);
    },
  }).single("profile");

  // Check file type
  function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    // Check mime type
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb("Error: Valid Files only!!...");
    }
  }

  upload(req, res, (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: err });
    } else {
      res
        .status(200)
        .json({ success: true, message: "Files uploaded successfully" });
    }
  });
};

export const verifyEmail = async (req, res) => {
  const { userId, token } = req.params;

  try {
    const result = await Verification.findOne({ userId });

    if (result) {
      const { expiresAt, token: hashedToken } = result;

      // token has expires
      if (expiresAt < Date.now()) {
        Verification.findOneAndDelete({ userId })
          .then(() => {
            User.findOneAndDelete({ _id: userId })
              .then(() => {
                const message = "Verification token has expired.";
                res.redirect(`/users/verified?status=error&message=${message}`);
              })
              .catch((error) => {
                console.error(error);
                res.redirect(`/users/verified?status=error&message=`);
              });
          })
          .catch((error) => {
            console.error(error);
            res.redirect(`/users/verified?message=`);
          });
      } else {
        //token valid
        compareString(token, hashedToken)
          .then((isMatch) => {
            if (isMatch) {
              User.findOneAndUpdate({ _id: userId }, { verified: true })
                .then(() => {
                  Verification.findOneAndDelete({ userId }).then(() => {
                    const message = "Email verified successfully";
                    res.redirect(
                      `/users/verified?status=success&message=${message}`
                    );
                  });
                })
                .catch((err) => {
                  console.log(err);
                  const message = "Verification failed or link is invalid";
                  res.redirect(
                    `/users/verified?status=error&message=${message}`
                  );
                });
            } else {
              // invalid token
              const message = "Verification failed or link is invalid";
              res.redirect(`/users/verified?status=error&message=${message}`);
            }
          })
          .catch((err) => {
            console.log(err);
            res.redirect(`/users/verified?message=`);
          });
      }
    } else {
      const message = "Invalid verification link. Try again later.";
      res.redirect(`/users/verified?status=error&message=${message}`);
    }
  } catch (error) {
    console.log(err);
    res.redirect(`/users/verified?message=`);
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: "FAILED",
        message: "Email address not found.",
      });
    }

    const existingRequest = await PasswordReset.findOne({ email });
    if (existingRequest) {
      if (existingRequest.expiresAt > Date.now()) {
        return res.status(201).json({
          status: "PENDING",
          message: "Reset password link has already been sent tp your email.",
        });
      }
      await PasswordReset.findOneAndDelete({ email });
    }
    await resetPasswordLink(user, res);
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { userId, token } = req.params;

  try {
    // find record
    const user = await User.findById(userId);

    if (!user) {
      const message = "Invalid password reset link. Try again";
      res.redirect(`/users/resetpassword?status=error&message=${message}`);
    }

    const resetPassword = await PasswordReset.findOne({ userId });

    if (!resetPassword) {
      const message = "Invalid password reset link. Try again";
      return res.redirect(
        `/users/resetpassword?status=error&message=${message}`
      );
    }

    const { expiresAt, token: resetToken } = resetPassword;

    if (expiresAt < Date.now()) {
      const message = "Reset Password link has expired. Please try again";
      res.redirect(`/users/resetpassword?status=error&message=${message}`);
    } else {
      const isMatch = await compareString(token, resetToken);

      if (!isMatch) {
        const message = "Invalid reset password link. Please try again";
        res.redirect(`/users/resetpassword?status=error&message=${message}`);
      } else {
        res.redirect(`/users/resetpassword?type=reset&id=${userId}`);
      }
    }
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { userId, password } = req.body;

    const hashedpassword = await hashString(password);

    const user = await User.findByIdAndUpdate(
      { _id: userId },
      { password: hashedpassword }
    );

    if (user) {
      await PasswordReset.findOneAndDelete({ userId });

      res.status(200).json({
        ok: true,
      });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.find();
    if (!allUsers || allUsers.length === 0) {
      res.status(404).send({
        success: false,
        message: "No Users found...",
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      users: allUsers,
    });

  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

export const getAllAdmins = async (req, res) => {
  try {
    const allAdmins = await User.find({ isAdmin: true });
    if (!allAdmins || allAdmins.length === 0) {
      res.status(404).send({
        success: false,
        message: "No Users found...",
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      users: allAdmins,
    });

  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

export const getUser = async (req, res) => {
  try {
    const userId = req.params.id;
    //Verify ID
    if (!userId) {
      res.status(403).json({
        success: false,
        message: "Bad Request: Please provide either id or userId",
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).send({
        success: false,
        message: "Please provide UserID",
      });
      return;
    }

    user.password = undefined;

    res.status(200).json({
      success: true,
      user: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
      // error: error.message,
      error: error,
    });
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { firstName, lastName, location, profileImg, profession } = req.body;

    if (!userId) {

    }

    if (!(firstName || lastName || profession || profileImg || location)) {
      next("Please provide all required fields");
      return;
    }

    console.log(req.body);

    const updatedUser = {
      _id: userId,
      firstName,
      lastName,
      location,
      profileImg,
      profession,
    };

    const user = await User.findByIdAndUpdate(userId, updatedUser, {
      new: true,
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const token = createJWT(user._id);
    user.password = undefined;

    res.status(200).json({
      sucess: true,
      message: "User updated successfully",
      user,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message, error: error });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const userId = req.params.id;
    const { senderId } = req.body;

    // Check if the sender and receiver exist
    const sender = await User.findById(senderId);
    const receiver = await User.findById(userId);

    if (!sender || !receiver) {
      return res.status(404).json({ message: 'Sender or receiver not found' });
    }

    const requestExist = await FriendRequest.findOne({
      requestFrom: senderId,
      requestTo: userId,
    });
    const accountExist = await FriendRequest.findOne({
      requestFrom: userId,
      requestTo: senderId,
    });
    if (requestExist || accountExist) {
      return res.status(404).json({ message: "Friend Request already sent." });
    }

    const newFriendRequest = await FriendRequest.create({
      requestFrom: senderId,
      requestTo: userId,
    });
    await newFriendRequest.save();

    res.status(201).json({
      success: true,
      message: "Friend Request sent Successfully...",
      friendlyRequest: newFriendRequest,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }
};

export const getFriendRequest = async (req, res) => {
  try {
    const userId = req.params.id;

    const request = await FriendRequest.find({
      requestTo: userId,
      requestStatus: "Pending",
    })
      .populate({
        path: "requestFrom",
        select: "firstName lastName profileImg profession -password",
      })
      .limit(10)
      .sort({
        _id: -1,
      });

    res.status(200).json({
      success: true,
      requests: request,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }
};

export const acceptRequest = async (req, res) => {
  try {
    const id = req.body.user.userId;
    const { rid, status } = req.body;

    const requestExist = await FriendRequest.findById(rid);
    if (!requestExist) {
      res.status(404).json("No Friend Request Found...");
    }

    const newFriendRequest = await FriendRequest.findByIdAndUpdate(
      { _id: rid },
      { requestStatus: status }
    );

    if (
      status.toLowerCase() !== "accepted" &&
      status.toLowerCase() !== "rejected"
    ) {
      res.status(400).json({ message: "Invalid Status" });
    }

    if (status.toLowerCase() === "accepted") {
      const user = await User.findById(id);
      user.friends.push(newFriendRequest?.requestFrom);
      await user.save();

      const friend = await User.findById(newFriendRequest?.requestFrom);
      friend.friends.push(newFriendRequest?.requestTo);
      await friend.save();
    }

    res.status(201).json({
      success: true,
      message: "Friend Request " + status,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }
};

export const suggestedFriends = async (req, res) => {
  try {
    const userId = req.params.id;

    // Fetch user's friend list
    const user = await User.findById(userId)
    const userFriends = user.friends;

    const queryObject = {
      _id: { $ne: userId },
      friends: { $nin: [...userFriends, userId] },
    };
    const suggestedFriends = await User.find(queryObject)
      .limit(10)
      .select("firstName lastName profileImg profession -password");

    res.status(200).json({
      success: true,
      data: suggestedFriends,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message, error: error });
  }
};

export const getAllFriends = async (req, res) => {
  const userId = req.params.id;
  if (!userId) {
    res.status(404).json({ message: 'Please Provide Id...' });
  }
  // Fetch user's friend list
  const user = await User.findById(userId).populate('friends', 'firstName lastName profileImg profession -password');

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.status(200).json({ success: true, data: user.friends });

}

export const deleteUser = async (req, res) => {
  const userId = req.params.id;
  if (!userId) {
    res.status(404).json({ message: "Please Provide User ID..." });
  }
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    res.status(404).json({ message: "User does not exist" });
  }

  res.status(200).json({ message: "User deleted successfully " });
}