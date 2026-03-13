const express = require('express');
const router = express.Router();
const { getComments, addComment, deleteComment } = require('../controllers/commentController');

router.get('/:postId', getComments);
router.post('/:postId', addComment);
router.delete('/:id', deleteComment);

module.exports = router;
