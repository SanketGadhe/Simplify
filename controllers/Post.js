const Post = require("../models/PostModel");
const user = require("../models/userProfileModel");
const mongoose=require("mongoose")
const ErrorResponse = require("../utils/errorHandler");
const createPost = async (req, res, next) => {
  const { title, content, attachments, tags, visiblity } = req.body;
  try {
    const createdPost = await Post.create({
      authorId: req.user,
      title,
      content,
      attachments,
      tags,
      visiblity,
    });
    const postUser = await user.findOne({ userId: req.user });

    postUser.posts.push(createdPost._id);
    await postUser.save();
    res.status(201).json({
      success: true,
      message: "Post created successfully",
      profile: createdPost,
    });
  } catch (err) {
    return next(new ErrorResponse(err.message, 500));
  }
};
const editPost = async (req, res, next) => {
    const { title, content, attachments, tags, visibility } = req.body;
  
    if (!mongoose.Types.ObjectId.isValid(req.params.post_id)) {
      return next(new ErrorResponse("Invalid post ID", 400));
    }
  
    try {
      // Find and update the post
      const updatedPost = await Post.findOneAndUpdate(
        { _id: req.params.post_id, authorId: req.user }, // Ensure the user is the author
        {
          ...(title && { title }),
          ...(content && { content }),
          ...(attachments && { attachments }),
          ...(tags && { tags }),
          ...(visibility && { visibility }),
          updatedAt: new Date(),
        },
        { new: true, runValidators: true } // Return the updated document and run validation
      );
  
      // Check if the post exists
      if (!updatedPost) {
        return next(new ErrorResponse("Post not found or not authorized", 404));
      }
  
      res.status(200).json({
        success: true,
        message: "Post edited successfully",
        post: updatedPost,
      });
    } catch (err) {
      return next(new ErrorResponse(err.message, 500));
    }
  };


const showPost = async (req, res, next) => {
    try {
        const posts = await Post.find();
        if (posts.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Nothing to see",
                posts: [],
            });
        }
        res.status(200).json({
            success: true,
            posts,
        });
    } catch (err) {
        return next(new ErrorResponse(err.message, 500));
    }
};
const deletePost = async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.post_id)) {
        return next(new ErrorResponse("Invalid post ID", 400));
    }

    try {
        const post = await Post.findOneAndDelete({ _id: req.params.post_id, authorId: req.user });

        if (!post) {
            return next(new ErrorResponse("Post not found or not authorized", 404));
        }

        const postUser = await user.findOne({ userId: req.user });
        postUser.posts.pull(post._id);
        await postUser.save();

        res.status(200).json({
            success: true,
            message: "Post deleted successfully",
        });
    } catch (err) {
        return next(new ErrorResponse(err.message, 500));
    }
};

module.exports={createPost,editPost,showPost,deletePost}