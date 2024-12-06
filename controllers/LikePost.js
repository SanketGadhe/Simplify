const Post = require('../models/PostModel');

const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (!post.likes.includes(req.user)) {
            post.likes.push(req.user);
            await post.save();
            return res.status(200).json({ message: 'Post liked', post });
        } else {
            return res.status(400).json({ message: 'Post already liked' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Dislike a post
const dislikePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const index = post.likes.indexOf(req.user);
        if (index !== -1) {
            post.likes.splice(index, 1);
            await post.save();
            return res.status(200).json({ message: 'Post disliked', post });
        } else {
            return res.status(400).json({ message: 'Post not liked yet' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports={likePost,dislikePost}