import express from "express";
import path from "path";
import {
  acceptRequest,
  changePassword,
  deleteUser,
  getAllAdmins,
  getAllFriends,
  getAllUsers,
  getFriendRequest,
  getUser,
  requestPasswordReset,
  resetPassword,
  sendFriendRequest,
  suggestedFriends,
  updateUser,
  uploadProfile,
  verifyEmail,
} from "../controllers/userController.js";
import userAuth from "../middleware/authMiddleware.js";

const router = express.Router();
const __dirname = path.resolve(path.dirname(""));

//Upload Profile
router.post("/upload-profile", uploadProfile);

router.get("/verify/:userId/:token", verifyEmail);
// PASSWORD RESET
router.post("/request-passwordreset", requestPasswordReset);
router.get("/reset-password/:userId/:token", resetPassword);
router.post("/reset-password", changePassword);

// user routes
router.get("/get-all-admins", getAllAdmins);
router.get("/get-all-users", getAllUsers);
router.get("/get-all-friends/:id?", getAllFriends);
router.post("/get-user/:id?", userAuth, getUser);
router.put("/update-user/:id?", userAuth, updateUser);

// friend request
router.post("/send-friend-request/:id?", sendFriendRequest);
router.get("/get-friend-requests/:id?", getFriendRequest);

// accept / deny friend request
router.post("/accept-request", userAuth, acceptRequest);

//suggested friends
router.get("/:id?/suggested-friends", suggestedFriends);

// Delete User
router.delete("/delete-user/:id?", deleteUser);

router.get("/verified", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/build", "index.html"));
});

router.get("/resetpassword", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/build", "index.html"));
});

export default router;
