import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StudentForm from '../components/StudentForm';
import { createStudent } from '../services/studentService';

function AddStudent() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (student) => {
    setSaving(true);
    setError('');

    try {
      await createStudent(student);
      navigate('/', {
        state: { message: `${student.name} was added successfully.` },
      });
    } catch (err) {
      setError(err.message);
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
          <h1>Add Student</h1>
          <p className="page-subtitle">
            Fill in the details below to create a new student record.
          </p>
        </div>
      </div>

      <div className="card form-card">
        <StudentForm
          onSubmit={handleSubmit}
          submitLabel="Add Student"
          saving={saving}
          error={error}
        />
      </div>
    </div>
  );
}

export default AddStudent;
