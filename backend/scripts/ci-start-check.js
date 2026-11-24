/**
 * CI startup smoke test.
 *
 * Boots the Express application on an ephemeral port, requests the health
 * endpoint, and exits with a non-zero status if the app fails to start or
 * does not respond correctly. A live MongoDB connection is not required
 * because this check only verifies that the HTTP application itself starts.
 */

const http = require('http');
const app = require('../app');

let finished = false;

const server = app.listen(0, '127.0.0.1', () => {
  const { port } = server.address();

  const finish = (exitCode, message) => {
    if (finished) {
      return;
    }

    finished = true;
    server.close(() => {
      if (exitCode === 0) {
        console.log(message);
      } else {
        console.error(message);
      }
      process.exit(exitCode);
    });
  };

  const request = http.get(
    { hostname: '127.0.0.1', port, path: '/', timeout: 5000 },
    (response) => {
      let body = '';

      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        body += chunk;
      });

      response.on('end', () => {
        if (response.statusCode !== 200) {
          finish(
            1,
            `Startup check failed: expected HTTP 200, received ${response.statusCode}.`
          );
          return;
        }

        try {
          const payload = JSON.parse(body);
          if (payload.success !== true) {
            throw new Error('response did not include success: true');
          }
        } catch (error) {
          finish(
            1,
            `Startup check failed: invalid JSON response (${error.message}).`
          );
          return;
        }

        finish(
          0,
          `Backend application started successfully on port ${port} and GET / returned 200.`
        );
      });
    }
  );

  request.on('timeout', () => {
    request.destroy(new Error('request timed out after 5 seconds'));
  });

  request.on('error', (error) => {
    finish(1, `Startup check failed: ${error.message}.`);
  });
});

server.on('error', (error) => {
  console.error(`Startup check failed: ${error.message}.`);
  process.exit(1);
});
