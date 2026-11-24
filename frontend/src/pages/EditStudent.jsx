import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Message from '../components/Message';
import StudentForm from '../components/StudentForm';
import { getStudentById, updateStudent } from '../services/studentService';

function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    const loadStudent = async () => {
      setLoading(true);
      setLoadError('');

      try {
        const data = await getStudentById(id);
        if (isActive) {
          setStudent(data);
        }
      } catch (err) {
        if (isActive) {
          setLoadError(err.message);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadStudent();

    return () => {
      isActive = false;
    };
  }, [id, reloadKey]);

  const handleSubmit = async (values) => {
    setSaving(true);
    setFormError('');

    try {
      await updateStudent(id, values);
      navigate('/', {
        state: { message: `${values.name}'s details were updated successfully.` },
      });
    } catch (err) {
      setFormError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <Link to="/" className="back-link">
            <span aria-hidden="true">&larr;</span> Back to Students
          </Link>
          <h1>Edit Student</h1>
          <p className="page-subtitle">
            {student
              ? `Update the record for ${student.name}.`
              : 'Update the student record.'}
          </p>
        </div>
      </div>

      <div className="card form-card">
        {loading ? (
          <div className="state-block">
            <span className="spinner" aria-hidden="true" />
            <p>Loading student...</p>
          </div>
        ) : loadError ? (
          <div className="state-block">
            <Message type="error">{loadError}</Message>
            <div className="actions">
              <Link to="/" className="btn btn-secondary">
                Back to Students
              </Link>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setReloadKey((key) => key + 1)}
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <StudentForm
            initialValues={student}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
            saving={saving}
            error={formError}
          />
        )}
      </div>
    </div>
  );
}

export default EditStudent;
