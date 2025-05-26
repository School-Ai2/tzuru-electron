const express = require('express');
const router = express.Router();
const {
  createClass,
  getTeacherClasses,
  getStudentClasses,
  joinClass,
  removeStudent
} = require('../controllers/classController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.post('/', createClass);
router.get('/teacher', getTeacherClasses);
router.get('/student', getStudentClasses);
router.post('/join', joinClass);
router.delete('/:classId/students/:studentId', removeStudent);

module.exports = router;