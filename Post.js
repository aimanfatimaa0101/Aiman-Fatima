const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Technology', 'Travel', 'Food', 'Lifestyle', 'Business', 'Health', 'Education', 'Entertainment', 'Other'],
    default: 'Other'
  },
  tags: [{
    type: String,
    trim: true
  }],
  featuredImage: {
    type: String,
    default: ''
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: String
  }],
  views: {
    type: Number,
    default: 0
  },
  published: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Auto-generate slug from title
postSchema.pre('save', async function(next) {
  if (this.isModified('title')) {
    const slugify = require('slugify');
    let slug = slugify(this.title, { lower: true, strict: true });
    const existing = await mongoose.model('Post').findOne({ slug, _id: { $ne: this._id } });
    if (existing) slug = `${slug}-${Date.now()}`;
    this.slug = slug;
  }
  next();
});

module.exports = mongoose.model('Post', postSchema);
