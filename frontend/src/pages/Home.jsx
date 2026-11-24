import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import Message from '../components/Message';
import { deleteStudent, getStudents } from '../services/studentService';

const getInitials = (name = '') => {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();

  return initials || '?';
};

function Home() {
  const location = useLocation();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getStudents();
      setStudents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Show the message passed by the Add/Edit pages, then clear the history state
  // so a refresh does not show a stale notification.
  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    if (!success) {
      return undefined;
    }

    const timer = setTimeout(() => setSuccess(''), 5000);
    return () => clearTimeout(timer);
  }, [success]);

  const handleConfirmDelete = async () => {
    if (!studentToDelete) {
      return;
    }

    setDeleting(true);
    setError('');

    try {
      await deleteStudent(studentToDelete._id);
      setStudents((previous) =>
        previous.filter((student) => student._id !== studentToDelete._id)
      );
      setSuccess(`${studentToDelete.name} was deleted successfully.`);
      setStudentToDelete(null);
    } catch (err) {
      setError(err.message);
      setStudentToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>Students</h1>
          <p className="page-subtitle">
            Manage every student record in one place.
          </p>
        </div>
        <Link to="/add" className="btn btn-primary">
          <span aria-hidden="true">+</span> Add Student
        </Link>
      </div>

      <Message type="success" onClose={() => setSuccess('')}>
        {success}
      </Message>
      <Message type="error" onClose={() => setError('')}>
        {error}
      </Message>

      <div className="card">
        {loading ? (
          <div className="state-block">
            <span className="spinner" aria-hidden="true" />
            <p>Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          error ? (
            <div className="state-block">
              <p>Students could not be loaded.</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={loadStudents}
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  width="30"
                  height="30"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 10 12 5 2 10l10 5 10-5Z" />
                  <path d="M6 12.5V17c0 1.6 2.7 3 6 3s6-1.4 6-3v-4.5" />
                  <path d="M22 10v6" />
                </svg>
              </div>
              <h2>No students yet</h2>
              <p>Add your first student to see them listed here.</p>
              <Link to="/add" className="btn btn-primary">
                Add Student
              </Link>
            </div>
          )
        ) : (
          <>
            <div className="card-toolbar">
              <span className="count-pill">
                {students.length} {students.length === 1 ? 'student' : 'students'}
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={loadStudents}
              >
                Refresh
              </button>
            </div>

            <div className="table-wrapper">
              <table className="students-table">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Email</th>
                    <th scope="col">Course</th>
                    <th scope="col">Semester</th>
                    <th scope="col">Phone</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id}>
                      <td data-label="Name">
                        <div className="student-identity">
                          <span className="avatar" aria-hidden="true">
                            {getInitials(student.name)}
                          </span>
                          <span className="student-name">{student.name}</span>
                        </div>
                      </td>
                      <td data-label="Email">
                        <a
                          className="email-link"
                          href={`mailto:${student.email}`}
                        >
                          {student.email}
                        </a>
                      </td>
                      <td data-label="Course">
                        <span className="course-pill">{student.course}</span>
                      </td>
                      <td data-label="Semester">
                        <span className="badge">Sem {student.semester}</span>
                      </td>
                      <td data-label="Phone">
                        <a className="phone-link" href={`tel:${student.phone}`}>
                          {student.phone}
                        </a>
                      </td>
                      <td data-label="Actions">
                        <div className="actions">
                          <Link
                            to={`/edit/${student._id}`}
                            className="btn btn-secondary btn-sm"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            className="btn btn-danger-soft btn-sm"
                            onClick={() => setStudentToDelete(student)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {studentToDelete && (
        <ConfirmDialog
          title="Delete student?"
          message={`This will permanently remove ${studentToDelete.name} (${studentToDelete.email}) from the system. This action cannot be undone.`}
          confirmLabel="Delete Student"
          loadingLabel="Deleting..."
          loading={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            if (!deleting) {
              setStudentToDelete(null);
            }
          }}
        />
      )}
    </div>
  );
}

export default Home;
