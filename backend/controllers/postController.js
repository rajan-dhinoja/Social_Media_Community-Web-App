import Comments from "../models/commentModel.js";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import multer from "multer";
import path from "path";

export const uploadFiles = (req, res) => {
  // Set storage engine
  const storage = multer.diskStorage({
    destination: function (req, files, cb) {
      cb(null, "public/files");
    },
    filename: function (req, files, cb) {
      cb(null, Date.now() + "-" + path.extname(files.originalname));
    },
  });

  // Init upload
  const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
      checkFileType(file, cb);
    },
  }).array("files", 5); // Allow up to 5 files

  // Check file type
  function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|mp4|wav|gif/;
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

export const createPost = async (req, res) => {
  try {
    const { userId, description } = req.body;
    const { files } = req.body;

    if (!description) {
      res.status(403).json("You must provide a description");
      return;
    }

    const post = await Post.create({
      userId,
      description,
      files
    })

    res.status(200).json({
      success: true,
      message: "Post created successfully",
      data: post,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message, error: error });
  }
};

export const getAllPosts = async (req, res) => {
  const allPosts = await Post.find().populate({
    path: "userId",
    select: "firstName lastName location profileImg -password",
  })
    .sort({ _id: -1 });
  if (!allPosts) {
    res.status(404).json({ message: "No posts found..." });
  }
  res.status(200).json({ success: true, posts: allPosts });
}

export const getPosts = async (req, res) => {
  try {
    const { userId } = req.body.user;
    const { search } = req.body;

    const user = await User.findById(userId)

    const friends = user?.friends?.toString().split(",") ?? [];
    friends.push(userId);

    const searchPostQuery = search
      ? { description: { $regex: search, $options: "i" } }
      : {};

    const posts = await Post.find(searchPostQuery)
      .populate({
        path: "userId",
        select: "firstName lastName location profileImg -password",
      })
      .sort({ _id: -1 });

    const friendsPosts = posts.filter((post) => {
      friends.includes(post?.userId?._id.toString());
    });
    const otherPosts = posts.filter(
      (post) => !friends.includes(post?.userId?._id.toString())
    );

    // Concatenate friends' posts and other posts
    const postsRes = friendsPosts.concat(search ? [] : otherPosts);

    res.status(200).json({
      success: true,
      message: "successfully",
      data: postsRes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message, error: error });
  }
};

export const getPost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id).populate({
      path: "userId",
      select: "firstName lastName location profileImg -password",
    });

    res.status(200).json({
      success: true,
      message: "successfully",
      data: post,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message, error: error });
  }
};

export const getUserPost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.find({ userId: id })
      .populate({
        path: "userId",
        select: "firstName lastName location profileImg -password",
      })
      .sort({ _id: -1 });

    res.status(200).json({
      success: true,
      message: "successfully",
      data: post,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message, error: error });
  }
};

export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const postComments = await Comments.find({ postId })
      .populate({
        path: "userId",
        select: "firstName lastName location profileImg -password",
      })
      .populate({
        path: "replies.userId",
        select: "firstName lastName location profileImg -password",
      })
      .sort({ _id: -1 });

    res.status(200).json({
      success: true,
      message: "successfully",
      data: postComments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message, error: error });
  }
};

export const likePost = async (req, res) => {
  try {
    const { userId } = req.body.user;
    const { id } = req.params;

    const post = await Post.findById(id);

    const index = post.likes.findIndex((pid) => pid === String(userId));
    if (index === -1) {
      post.likes.push(userId);
    } else {
      post.likes = post.likes.filter((pid) => pid !== String(userId));
    }

    const newPost = await Post.findByIdAndUpdate(id, post, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "successfully",
      data: newPost,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message, error: error });
  }
};

export const likePostComment = async (req, res) => {
  const { userId } = req.body.user;
  const { id, rid } = req.params;

  try {
    if (rid === undefined || rid === null || rid === `false`) {
      const comment = await Comments.findById(id);

      const index = comment.likes.findIndex((el) => el === String(userId));
      if (index === -1) {
        comment.likes.push(userId);
      } else {
        comment.likes = comment.likes.filter((i) => i !== String(userId));
      }

      const updated = await Comments.findByIdAndUpdate(id, comment, {
        new: true,
      });

      res.status(201).json(updated);
    } else {
      const replyComments = await Comments.findOne(
        { _id: id },
        {
          replies: {
            $elemMatch: {
              _id: rid,
            },
          },
        }
      );

      const index = replyComments?.replies[0]?.likes.findIndex(
        (i) => i === String(userId)
      );

      if (index === -1) {
        replyComments.replies[0].likes.push(userId);
      } else {
        replyComments.replies[0].likes = replyComments.replies[0]?.likes.filter(
          (i) => i !== String(userId)
        );
      }

      const query = { _id: id, "replies._id": rid };

      const updated = {
        $set: {
          "replies.$.likes": replyComments.replies[0].likes,
        },
      };

      const result = await Comments.updateOne(query, updated, { new: true });

      res.status(201).json(result);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message, error: error });
  }
};

export const commentPost = async (req, res) => {
  try {
    const { comment, from } = req.body;
    const { userId } = req.body.user;
    const { id } = req.params;

    if (comment === null) {
      return res.status(404).json({ message: "Comment is required." });
    }

    const newComment = new Comments({ comment, from, userId, postId: id });

    await newComment.save();

    //updating the post with the comments id
    const post = await Post.findById(id);

    post.comments.push(newComment._id);

    const updatedPost = await Post.findByIdAndUpdate(id, post, {
      new: true,
    });

    res.status(201).json(newComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message, error: error });
  }
};

export const replyPostComment = async (req, res) => {
  const { userId } = req.body.user;
  const { comment, replyAt, from } = req.body;
  const { id } = req.params;

  if (comment === null) {
    return res.status(404).json({ message: "Comment is required." });
  }

  try {
    const commentInfo = await Comments.findById(id);

    commentInfo.replies.push({
      comment,
      replyAt,
      from,
      userId,
      created_At: Date.now(),
    });

    commentInfo.save();

    res.status(200).json(commentInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message, error: error });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    await Post.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message, error: error });
  }
};