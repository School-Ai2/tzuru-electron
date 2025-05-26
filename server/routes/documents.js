const express = require('express');
const router = express.Router();
const {
  uploadDocument,
  getClassDocuments,
  getDocument,
  deleteDocument
} = require('../controllers/documentController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.post('/upload/:classId', uploadDocument);
router.get('/class/:classId', getClassDocuments);
router.get('/:documentId', getDocument);
router.delete('/:documentId', deleteDocument);

module.exports = router;