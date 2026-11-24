import api from './api';

const RESOURCE = '/students';

// GET /api/students
export const getStudents = async () => {
  const { data } = await api.get(RESOURCE);
  return data.data;
};

// GET /api/students/:id
export const getStudentById = async (id) => {
  const { data } = await api.get(`${RESOURCE}/${id}`);
  return data.data;
};

// POST /api/students
export const createStudent = async (student) => {
  const { data } = await api.post(RESOURCE, student);
  return data.data;
};

// PUT /api/students/:id
export const updateStudent = async (id, student) => {
  const { data } = await api.put(`${RESOURCE}/${id}`, student);
  return data.data;
};

// DELETE /api/students/:id
export const deleteStudent = async (id) => {
  const { data } = await api.delete(`${RESOURCE}/${id}`);
  return data.data;
};
