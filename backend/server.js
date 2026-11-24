require('dotenv').config();

// dotenv must run before anything reads process.env, so it stays on the very
// first line. app.js and config/db.js are required afterwards.
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, HOST, () => {
      const displayHost = HOST === '0.0.0.0' ? 'localhost' : HOST;
      console.log(`Server running on http://${displayHost}:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Close the HTTP server cleanly when PM2 restarts or stops the process.
    const shutdown = (signal) => {
      console.log(`${signal} received, shutting down...`);

      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });

      // Do not hang forever if a client keeps a connection open.
      setTimeout(() => {
        console.error('Forced shutdown after timeout.');
        process.exit(1);
      }, 10000).unref();
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);

    // config/db.js already prints a detailed error chain. The stack helps in
    // development but is kept out of production logs.
    if (process.env.NODE_ENV !== 'production' && error.stack) {
      console.error(error.stack);
    }

    process.exit(1);
  }
};

startServer();
