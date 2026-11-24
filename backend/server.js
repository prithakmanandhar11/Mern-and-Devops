require('dotenv').config();

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const studentRoutes = require('./routes/studentRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

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

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
