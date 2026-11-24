import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Turn every failed request into a normal Error with a readable message.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject(
        new Error('Cannot reach the server. Make sure the backend is running.')
      );
    }

    const data = error.response.data;
    const details =
      Array.isArray(data?.errors) && data.errors.length > 0
        ? data.errors.join(' ')
        : '';

    return Promise.reject(
      new Error(
        details || data?.message || 'Something went wrong. Please try again.'
      )
    );
  }
);

export default api;
