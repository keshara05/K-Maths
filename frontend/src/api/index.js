import api from './axiosClient';

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  refresh:  (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout:   (refreshToken) => api.post('/auth/logout', { refreshToken }),
  getMe:    () => api.get('/auth/me'),
  updateMe: (data) => api.patch('/auth/me', data),
};

// ── Courses ───────────────────────────────────────────────────────────────────
export const courseApi = {
  list:      () => api.get('/courses'),
  mine:      () => api.get('/courses/mine'),
  get:       (id) => api.get(`/courses/${id}`),
  create:    (formData) => api.post('/courses', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:    (id, data) => api.patch(`/courses/${id}`, data),
  delete:    (id) => api.delete(`/courses/${id}`),
};

// ── Lessons ───────────────────────────────────────────────────────────────────
export const lessonApi = {
  byCourse:   (courseId) => api.get(`/lessons/course/${courseId}`),
  get:        (id) => api.get(`/lessons/${id}`),
  videoUrl:   (id) => api.get(`/lessons/${id}/video-url`),
  create:     (data) => api.post('/lessons', data),
  uploadVideo:(id, formData, onProgress) =>
    api.post(`/lessons/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => onProgress && onProgress(Math.round((e.loaded * 100) / e.total)),
    }),
  update:     (id, data) => api.patch(`/lessons/${id}`, data),
  delete:     (id) => api.delete(`/lessons/${id}`),
};

// ── Enrollments ───────────────────────────────────────────────────────────────
export const enrollmentApi = {
  enroll:     (courseId) => api.post('/enrollments', { course_id: courseId }),
  mine:       () => api.get('/enrollments/mine'),
  adminAll:   (params) => api.get('/enrollments/admin/all', { params }),
  updateStatus:(id, status) => api.patch(`/enrollments/${id}/status`, { status }),
};

// ── Payments ──────────────────────────────────────────────────────────────────
export const paymentApi = {
  initiate:   (data) => api.post('/payments/initiate', data),
  history:    () => api.get('/payments/history'),
  adminAll:   (params) => api.get('/payments/admin/all', { params }),
  summary:    () => api.get('/payments/admin/summary'),
};

// ── Attendance ────────────────────────────────────────────────────────────────
export const attendanceApi = {
  join:       (lessonId) => api.post(`/attendance/join/${lessonId}`),
  leave:      (lessonId) => api.post(`/attendance/leave/${lessonId}`),
  student:    (id) => api.get(`/attendance/student/${id}`),
  lesson:     (lessonId) => api.get(`/attendance/lesson/${lessonId}`),
  mark:       (data) => api.post('/attendance/admin/mark', data),
  summary:    (params) => api.get('/attendance/admin/summary', { params }),
};

// ── Quizzes ───────────────────────────────────────────────────────────────────
export const quizApi = {
  get:        (id) => api.get(`/quizzes/${id}`),
  submit:     (id, answers) => api.post(`/quizzes/${id}/submit`, { answers }),
  result:     (id) => api.get(`/quizzes/${id}/result`),
  progress:   () => api.get('/quizzes/progress/me'),
  adminList:  (params) => api.get('/quizzes/admin/list', { params }),
  create:     (data) => api.post('/quizzes/admin/create', data),
};

// ── Resources ─────────────────────────────────────────────────────────────────
export const resourceApi = {
  list:       (params) => api.get('/resources', { params }),
  download:   (id) => api.get(`/resources/${id}/download`),
  create:     (formData) => api.post('/resources/admin/create', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:     (id) => api.delete(`/resources/admin/${id}`),
};

// ── Assignments ───────────────────────────────────────────────────────────────
export const assignmentApi = {
  list:       (params) => api.get('/assignments', { params }),
  submit:     (id, formData) => api.post(`/assignments/${id}/submit`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  create:     (data) => api.post('/assignments/admin/create', data),
  submissions:(id) => api.get(`/assignments/admin/${id}/submissions`),
  grade:      (id, data) => api.patch(`/assignments/admin/submissions/${id}/grade`, data),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  overview:   () => api.get('/admin/analytics/overview'),
  engagement: () => api.get('/admin/analytics/engagement'),
  users:      (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};
