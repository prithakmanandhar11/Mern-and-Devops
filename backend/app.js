const express = require('express');
const cors = require('cors');

const studentRoutes = require('./routes/studentRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// The Express app is defined separately from the server entry point so it can
// be started in tests and CI without opening a MongoDB connection.
const app = express();

// Allow the React app (any origin during development) to call this API.
app.use(cors());
app.use(express.json());

// Small health check.
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Student Management System API is running',
    endpoints: '/api/students',
  });
});

app.use('/api/students', studentRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
