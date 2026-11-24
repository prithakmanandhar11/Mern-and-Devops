const mongoose = require('mongoose');
const Student = require('../models/Student');

const REQUIRED_FIELDS = ['name', 'email', 'course', 'semester', 'phone'];

const isEmpty = (value) =>
  value === undefined ||
  value === null ||
  (typeof value === 'string' && value.trim() === '');

/**
 * Validate the request body before touching the database so the API returns
 * friendly, field-level messages instead of raw Mongoose errors.
 */
const validateStudentPayload = (body = {}) => {
  const errors = [];

  REQUIRED_FIELDS.forEach((field) => {
    if (isEmpty(body[field])) {
      errors.push(`${field} is required`);
    }
  });

  if (!isEmpty(body.email) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(body.email).trim())) {
    errors.push('Please provide a valid email address');
  }

  if (!isEmpty(body.semester)) {
    const semester = Number(body.semester);
    if (!Number.isInteger(semester) || semester < 1 || semester > 12) {
      errors.push('Semester must be a whole number between 1 and 12');
    }
  }

  if (!isEmpty(body.phone) && !/^[0-9+\-\s()]{7,20}$/.test(String(body.phone).trim())) {
    errors.push('Please provide a valid phone number');
  }

  return errors;
};

const buildStudentPayload = (body = {}) => ({
  name: String(body.name).trim(),
  email: String(body.email).trim().toLowerCase(),
  course: String(body.course).trim(),
  semester: Number(body.semester),
  phone: String(body.phone).trim(),
});

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// @desc    Create a student
// @route   POST /api/students
// @access  Public
const createStudent = async (req, res) => {
  const errors = validateStudentPayload(req.body);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  const student = await Student.create(buildStudentPayload(req.body));

  res.status(201).json({
    success: true,
    message: 'Student created successfully',
    data: student,
  });
};

// @desc    Get all students
// @route   GET /api/students
// @access  Public
const getStudents = async (req, res) => {
  const students = await Student.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: students.length,
    data: students,
  });
};

// @desc    Get a single student
// @route   GET /api/students/:id
// @access  Public
const getStudentById = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid student id',
    });
  }

  const student = await Student.findById(id);

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found',
    });
  }

  res.status(200).json({
    success: true,
    data: student,
  });
};

// @desc    Update a student
// @route   PUT /api/students/:id
// @access  Public
const updateStudent = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid student id',
    });
  }

  const errors = validateStudentPayload(req.body);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  const student = await Student.findByIdAndUpdate(
    id,
    buildStudentPayload(req.body),
    { new: true, runValidators: true }
  );

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Student updated successfully',
    data: student,
  });
};

// @desc    Delete a student
// @route   DELETE /api/students/:id
// @access  Public
const deleteStudent = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid student id',
    });
  }

  const student = await Student.findByIdAndDelete(id);

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Student deleted successfully',
    data: student,
  });
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};
