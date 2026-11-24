import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="container">
      <div className="card not-found">
        <span className="not-found-code">404</span>
        <h1>Page not found</h1>
        <p>The page you are looking for does not exist.</p>
        <Link to="/" className="btn btn-primary">
          Back to Students
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
