module.exports = {
  apps: [
    {
      // PM2 process name used by logs, restart, reload and status commands.
      name: 'student-management-api',
      script: './server.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '350M',
      kill_timeout: 5000,
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: 'logs/pm2-error.log',
      out_file: 'logs/pm2-out.log',
      env: {
        // application secrets stay in backend/.env and are loaded by dotenv.
        NODE_ENV: 'production',
      },
    },
  ],
};
