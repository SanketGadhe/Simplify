const Post = require("../models/PostModel");
const createComment = async (req, res, next) => {
  const { content } = req.body;
console.log(req.params.post_id)
  try {
    const post = await Post.findById(req.params.post_id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Sanitize content to prevent XSS (optional, but recommended)
    const sanitizedContent = content
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Push comment to post
    post.comments.push({ userId: req.user, content: sanitizedContent });
    console.log("object",post)
    await post.save();

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
    });
  } catch (err) {
    next(err); // Pass error to error handler
  }
};

// Edit a comment on a post
const editComment = async (req, res, next) => {
  const { content } = req.body;

  try {
    const post = await Post.findById(req.params.post_id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = post.comments.id(req.params.comment_id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Authorization check: ensure the user owns the comment
    if (comment.userId.toString() !== req.user.toString()) {
      return res
        .status(403)
        .json({ error: "You are not authorized to edit this comment" });
    }

    // Sanitize content to prevent XSS
    const sanitizedContent = content
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Update the comment content
    comment.content = sanitizedContent;
    await post.save();

    res.status(200).json({
      success: true,
      message: "Comment edited successfully",
    });
  } catch (err) {
    next(err); // Pass error to error handler
  }
};

module.exports = { createComment, editComment };
