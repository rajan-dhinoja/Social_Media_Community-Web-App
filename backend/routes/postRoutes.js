import express from "express";
import {
  commentPost,
  createPost,
  deletePost,
  getAllPosts,
  getComments,
  getPost,
  getPosts,
  getUserPost,
  likePost,
  likePostComment,
  replyPostComment,
  uploadFiles,
} from "../controllers/postController.js";
import userAuth from "../middleware/authMiddleware.js";
import multer from "multer";

const router = express.Router();

//upload files for Posts
router.post("/upload-files", uploadFiles);

// crete post
router.post("/create-post", userAuth, createPost);

// get posts
router.get("/get-all-posts", getAllPosts);
router.post("/", userAuth, getPosts);
router.post("/:id", userAuth, getPost);

router.post("/get-user-post/:id", userAuth, getUserPost);

// get comments
router.get("/comments/:postId", getComments);

//like and comment on posts
router.post("/like/:id", userAuth, likePost);
router.post("/like-comment/:id/:rid?", userAuth, likePostComment);
router.post("/comment/:id", userAuth, commentPost);
router.post("/reply-comment/:id", userAuth, replyPostComment);

//delete post
router.delete("/delete-post/:id", deletePost);

export default router;
