const Comment = require('../models/Comment');
const Post = require('../models/Post');

exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId }).sort('-createdAt');
    res.json({ success: true, data: comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { name, email, content } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const comment = await Comment.create({ post: req.params.postId, name, email, content });
    res.status(201).json({ success: true, data: comment, message: 'Comment added' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
