const Class = require('../models/Class');
const Document = require('../models/Document');
const User = require('../models/User');

// @desc    Create a new class
// @route   POST /api/classes
// @access  Private (Teachers only)
exports.createClass = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if user is a teacher
    if (req.user.userType !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can create classes'
      });
    }

    const newClass = await Class.create({
      name,
      description,
      teacherId: req.user._id
    });

    res.status(201).json({
      success: true,
      data: newClass
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all classes for a teacher
// @route   GET /api/classes/teacher
// @access  Private (Teachers only)
exports.getTeacherClasses = async (req, res) => {
  try {
    if (req.user.userType !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can access this route'
      });
    }

    const classes = await Class.find({ teacherId: req.user._id })
      .populate('students', 'name email')
      .populate('documents', 'originalName uploadDate');

    res.status(200).json({
      success: true,
      data: classes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all classes for a student
// @route   GET /api/classes/student
// @access  Private (Students only)
exports.getStudentClasses = async (req, res) => {
  try {
    if (req.user.userType !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can access this route'
      });
    }

    const classes = await Class.find({ students: req.user._id })
      .populate('teacherId', 'name email')
      .populate('documents', 'originalName uploadDate');

    res.status(200).json({
      success: true,
      data: classes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Join a class (for students)
// @route   POST /api/classes/join
// @access  Private (Students only)
exports.joinClass = async (req, res) => {
  try {
    const { classCode } = req.body;

    if (req.user.userType !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can join classes'
      });
    }

    const classToJoin = await Class.findOne({ classCode: classCode.toUpperCase() });

    if (!classToJoin) {
      return res.status(404).json({
        success: false,
        message: 'Invalid class code'
      });
    }

    // Check if student is already in the class
    if (classToJoin.students.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this class'
      });
    }

    // Add student to class
    classToJoin.students.push(req.user._id);
    await classToJoin.save();

    res.status(200).json({
      success: true,
      message: 'Successfully joined the class',
      data: classToJoin
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove student from class
// @route   DELETE /api/classes/:classId/students/:studentId
// @access  Private (Teachers only)
exports.removeStudent = async (req, res) => {
  try {
    const { classId, studentId } = req.params;

    if (req.user.userType !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can remove students'
      });
    }

    const classToUpdate = await Class.findOne({ 
      _id: classId, 
      teacherId: req.user._id 
    });

    if (!classToUpdate) {
      return res.status(404).json({
        success: false,
        message: 'Class not found or you are not the teacher'
      });
    }

    classToUpdate.students = classToUpdate.students.filter(
      student => student.toString() !== studentId
    );

    await classToUpdate.save();

    res.status(200).json({
      success: true,
      message: 'Student removed from class'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};