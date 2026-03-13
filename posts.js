const express = require('express');
const router = express.Router();
const {
  getAllPosts,
  getFeaturedPost,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  getAdminPosts
} = require('../controllers/postController');

router.get('/admin/all', getAdminPosts);
router.get('/featured', getFeaturedPost);
router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.post('/', createPost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);
router.post('/:id/like', likePost);

module.exports = router;
