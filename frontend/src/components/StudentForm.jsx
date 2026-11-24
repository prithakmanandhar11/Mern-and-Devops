import { useState } from 'react';
import { Link } from 'react-router-dom';
import Message from './Message';

const EMPTY_STUDENT = {
  name: '',
  email: '',
  course: '',
  semester: '',
  phone: '',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+\-\s()]{7,20}$/;

const validate = (values) => {
  const errors = {};

  if (!values.name.trim()) {
    errors.name = 'Name is required';
  }

  if (!values.email.trim()) {
    errors.email = 'Email is required';
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Enter a valid email address';
  }

  if (!values.course.trim()) {
    errors.course = 'Course is required';
  }

  if (values.semester === '') {
    errors.semester = 'Semester is required';
  } else {
    const semester = Number(values.semester);
    if (!Number.isInteger(semester) || semester < 1 || semester > 12) {
      errors.semester = 'Semester must be between 1 and 12';
    }
  }

  if (!values.phone.trim()) {
    errors.phone = 'Phone is required';
  } else if (!PHONE_PATTERN.test(values.phone.trim())) {
    errors.phone = 'Enter a valid phone number';
  }

  return errors;
};

function StudentForm({
  initialValues,
  onSubmit,
  submitLabel = 'Save Student',
  saving = false,
  error = '',
}) {
  const [values, setValues] = useState(() => ({
    name: initialValues?.name || '',
    email: initialValues?.email || '',
    course: initialValues?.course || '',
    semester:
      initialValues?.semester !== undefined && initialValues?.semester !== null
        ? String(initialValues.semester)
        : '',
    phone: initialValues?.phone || '',
  }));
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = validate(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSubmit({
      name: values.name.trim(),
      email: values.email.trim(),
      course: values.course.trim(),
      semester: Number(values.semester),
      phone: values.phone.trim(),
    });
  };

  return (
    <form className="student-form" onSubmit={handleSubmit} noValidate>
      {error && <Message type="error">{error}</Message>}

      <div className="form-grid">
        <div className={`form-field full${errors.name ? ' has-error' : ''}`}>
          <label htmlFor="name">
            Name <span className="required">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="e.g. Aarav Sharma"
            value={values.name}
            onChange={handleChange}
            maxLength={100}
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <span className="field-error" id="name-error">
              {errors.name}
            </span>
          )}
        </div>

        <div className={`form-field full${errors.email ? ' has-error' : ''}`}>
          <label htmlFor="email">
            Email <span className="required">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="e.g. aarav.sharma@example.com"
            value={values.email}
            onChange={handleChange}
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <span className="field-error" id="email-error">
              {errors.email}
            </span>
          )}
        </div>

        <div className={`form-field full${errors.course ? ' has-error' : ''}`}>
          <label htmlFor="course">
            Course <span className="required">*</span>
          </label>
          <input
            id="course"
            name="course"
            type="text"
            placeholder="e.g. B.Sc. Computer Science"
            value={values.course}
            onChange={handleChange}
            maxLength={100}
            aria-invalid={Boolean(errors.course)}
            aria-describedby={errors.course ? 'course-error' : undefined}
          />
          {errors.course && (
            <span className="field-error" id="course-error">
              {errors.course}
            </span>
          )}
        </div>

        <div className={`form-field${errors.semester ? ' has-error' : ''}`}>
          <label htmlFor="semester">
            Semester <span className="required">*</span>
          </label>
          <input
            id="semester"
            name="semester"
            type="number"
            placeholder="1 - 12"
            min="1"
            max="12"
            step="1"
            value={values.semester}
            onChange={handleChange}
            aria-invalid={Boolean(errors.semester)}
            aria-describedby={errors.semester ? 'semester-error' : 'semester-hint'}
          />
          {errors.semester ? (
            <span className="field-error" id="semester-error">
              {errors.semester}
            </span>
          ) : (
            <span className="field-hint" id="semester-hint">
              A whole number from 1 to 12
            </span>
          )}
        </div>

        <div className={`form-field${errors.phone ? ' has-error' : ''}`}>
          <label htmlFor="phone">
            Phone <span className="required">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="e.g. +91 98765 43210"
            value={values.phone}
            onChange={handleChange}
            maxLength={20}
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
          />
          {errors.phone && (
            <span className="field-error" id="phone-error">
              {errors.phone}
            </span>
          )}
        </div>
      </div>

      <div className="form-actions">
        <Link to="/" className="btn btn-secondary">
          Cancel
        </Link>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? <span className="btn-spinner" aria-hidden="true" /> : null}
          {saving ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default StudentForm;
