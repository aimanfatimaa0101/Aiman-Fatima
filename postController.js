const Post = require('../models/Post');

// GET /api/posts - Fetch all posts with filtering, search, pagination
exports.getAllPosts = async (req, res) => {
  try {
    const { search, category, tags, page = 1, limit = 9, sort = '-createdAt' } = req.query;
    const query = { published: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }
    if (category && category !== 'All') query.category = category;
    if (tags) query.tags = { $in: tags.split(',') };

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-content');

    res.json({
      success: true,
      data: posts,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/posts/:id - Get single post
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { slug: req.params.id }] },
      { $inc: { views: 1 } },
      { new: true }
    ).populate('comments');

    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/posts/id/:id - Get post by MongoDB ID
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/posts - Create new post
exports.createPost = async (req, res) => {
  try {
    const { title, description, content, author, category, tags, featuredImage, date } = req.body;
    const tagsArray = Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []);

    const post = new Post({
      title, description, content, author, category,
      tags: tagsArray,
      featuredImage: featuredImage || req.file?.path || '',
      ...(date && { createdAt: new Date(date) })
    });

    await post.save();
    res.status(201).json({ success: true, data: post, message: 'Post created successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/posts/:id - Update post
exports.updatePost = async (req, res) => {
  try {
    const { title, description, content, author, category, tags, featuredImage } = req.body;
    const tagsArray = Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []);

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { title, description, content, author, category, tags: tagsArray, featuredImage: featuredImage || req.file?.path || '' },
      { new: true, runValidators: true }
    );

    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, data: post, message: 'Post updated successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/posts/:id - Delete post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/posts/:id/like - Toggle like
exports.likePost = async (req, res) => {
  try {
    const { userId } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const alreadyLiked = post.likedBy.includes(userId);
    if (alreadyLiked) {
      post.likedBy.pull(userId);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      post.likedBy.push(userId);
      post.likes += 1;
    }
    await post.save();
    res.json({ success: true, likes: post.likes, liked: !alreadyLiked });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/posts/related/:id - Get related posts
exports.getRelatedPosts = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const related = await Post.find({
      _id: { $ne: post._id },
      $or: [{ category: post.category }, { tags: { $in: post.tags } }],
      published: true
    }).limit(3).select('-content');

    res.json({ success: true, data: related });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
