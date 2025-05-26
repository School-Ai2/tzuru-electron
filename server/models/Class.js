const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a class name'],
    trim: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  classCode: {
    type: String,
    unique: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate unique class code before saving
ClassSchema.pre('save', async function(next) {
  if (this.isNew && !this.classCode) {
    // Generate a random 6-character code
    let code;
    let existingClass;
    
    do {
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
      existingClass = await this.constructor.findOne({ classCode: code });
    } while (existingClass);
    
    this.classCode = code;
  }
  next();
});

module.exports = mongoose.model('Class', ClassSchema);