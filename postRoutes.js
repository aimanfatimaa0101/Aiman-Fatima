const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getAllPosts, getPost, getPostById, createPost,
  updatePost, deletePost, likePost, getRelatedPosts
} = require('../controllers/postController');

// Setup multer for image upload
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', getAllPosts);
router.get('/id/:id', getPostById);
router.get('/related/:id', getRelatedPosts);
router.get('/:id', getPost);
router.post('/', upload.single('featuredImage'), createPost);
router.put('/:id', upload.single('featuredImage'), updatePost);
router.delete('/:id', deletePost);
router.post('/:id/like', likePost);

module.exports = router;
