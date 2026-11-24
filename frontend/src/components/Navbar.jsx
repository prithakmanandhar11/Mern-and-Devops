import { NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand" aria-label="Student Management System home">
          <span className="brand-mark" aria-hidden="true">
            SMS
          </span>
          <span className="brand-text">
            <span className="brand-title">Student Manager</span>
            <span className="brand-subtitle">Student Management System</span>
          </span>
        </NavLink>

        <nav className="nav-links" aria-label="Main navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            Students
          </NavLink>
          <NavLink
            to="/add"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            Add Student
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
