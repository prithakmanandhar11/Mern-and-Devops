const express = require('express');
const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentController');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router
  .route('/')
  .get(asyncHandler(getStudents))
  .post(asyncHandler(createStudent));

router
  .route('/:id')
  .get(asyncHandler(getStudentById))
  .put(asyncHandler(updateStudent))
  .delete(asyncHandler(deleteStudent));

module.exports = router;
