const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
    course: {
      type: String,
      required: [true, 'Course is required'],
      trim: true,
      maxlength: [100, 'Course cannot exceed 100 characters'],
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [1, 'Semester must be at least 1'],
      max: [12, 'Semester cannot exceed 12'],
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
      match: [
        /^[0-9+\-\s()]{7,20}$/,
        'Please provide a valid phone number',
      ],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// `unique: true` on the email field already creates the unique index.

module.exports = mongoose.model('Student', studentSchema);
