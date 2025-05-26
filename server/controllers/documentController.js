const Document = require('../models/Document');
const Class = require('../models/Class');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads/';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /txt|pdf|docx|doc|md/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only .txt, .pdf, .docx, .doc, and .md files are allowed'));
    }
  }
}).single('document');

// Helper function to process documents to text
async function processDocumentToText(filePath, fileType) {
  try {
    // For now, we'll only handle text files
    // In a real implementation, you'd use libraries like:
    // - pdf-parse for PDFs
    // - mammoth for DOCX files
    // - textract for various formats
    
    if (fileType === 'text/plain' || fileType === 'text/markdown') {
      const content = await fs.readFile(filePath, 'utf8');
      return content;
    } else {
      // Placeholder for other file types
      return 'Document processing for this file type is not yet implemented.';
    }
  } catch (error) {
    console.error('Error processing document:', error);
    throw error;
  }
}

// @desc    Upload document to a class
// @route   POST /api/documents/upload/:classId
// @access  Private (Teachers only)
exports.uploadDocument = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    try {
      const { classId } = req.params;

      if (req.user.userType !== 'teacher') {
        return res.status(403).json({
          success: false,
          message: 'Only teachers can upload documents'
        });
      }

      // Verify the class exists and belongs to the teacher
      const classExists = await Class.findOne({ 
        _id: classId, 
        teacherId: req.user._id 
      });

      if (!classExists) {
        return res.status(404).json({
          success: false,
          message: 'Class not found or you are not the teacher'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Please upload a file'
        });
      }

      // Process the document to text
      const processedContent = await processDocumentToText(
        req.file.path, 
        req.file.mimetype
      );

      // Create document record
      const document = await Document.create({
        originalName: req.file.originalname,
        processedContent,
        fileType: req.file.mimetype,
        uploadedBy: req.user._id,
        classId: classId,
        fileSize: req.file.size,
        processingStatus: 'completed'
      });

      // Add document to class
      classExists.documents.push(document._id);
      await classExists.save();

      // Delete the uploaded file after processing
      await fs.unlink(req.file.path);

      res.status(201).json({
        success: true,
        data: document
      });
    } catch (error) {
      // Clean up uploaded file if error occurs
      if (req.file) {
        await fs.unlink(req.file.path).catch(console.error);
      }
      
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });
};

// @desc    Get documents for a class
// @route   GET /api/documents/class/:classId
// @access  Private
exports.getClassDocuments = async (req, res) => {
  try {
    const { classId } = req.params;

    // Check if user has access to this class
    const classExists = await Class.findOne({
      _id: classId,
      $or: [
        { teacherId: req.user._id },
        { students: req.user._id }
      ]
    });

    if (!classExists) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this class'
      });
    }

    const documents = await Document.find({ classId })
      .populate('uploadedBy', 'name')
      .select('-processedContent'); // Don't send content in list

    res.status(200).json({
      success: true,
      data: documents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single document content
// @route   GET /api/documents/:documentId
// @access  Private
exports.getDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findById(documentId)
      .populate('classId', 'students teacherId');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check if user has access
    const hasAccess = 
      document.classId.teacherId.toString() === req.user._id.toString() ||
      document.classId.students.includes(req.user._id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this document'
      });
    }

    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:documentId
// @access  Private (Teachers only)
exports.deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    if (req.user.userType !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can delete documents'
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      uploadedBy: req.user._id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or you are not the owner'
      });
    }

    // Remove document from class
    await Class.updateOne(
      { _id: document.classId },
      { $pull: { documents: documentId } }
    );

    // Delete document
    await document.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};