const express = require('express');
const cors = require('cors');

const studentRoutes = require('./routes/studentRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// The Express app is defined separately from the server entry point so it can
// be started in tests and CI without opening a MongoDB connection.
const app = express();

// Nginx is the only reverse proxy in front of the API on EC2.
app.set('trust proxy', 1);

// Do not advertise the Express version in response headers.
app.disable('x-powered-by');

// Allow all origins by default for local development. On EC2 the frontend is
// served by the same Nginx host, so API requests are same-origin and CORS does
// not apply. Set CLIENT_ORIGIN (comma-separated) to restrict browser origins.
const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors(allowedOrigins.length > 0 ? { origin: allowedOrigins } : {}));
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
