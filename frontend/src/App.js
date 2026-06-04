import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';

import { fetchMe } from './app/slices/authSlice';

// Layout
import StudentLayout from './components/common/StudentLayout';
import AdminLayout   from './components/common/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import PublicLayout  from './components/common/PublicLayout';

// Auth pages
import Login    from './pages/auth/Login';
import Register from './pages/auth/Register';
import LandingPage from './pages/LandingPage';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import MyClasses        from './pages/student/MyClasses';
import VideoVault       from './pages/student/VideoVault';
import VideoPlayer      from './pages/student/VideoPlayer';
import QuizPage         from './pages/student/QuizPage';
import Assignments      from './pages/student/Assignments';
import Resources        from './pages/student/Resources';
import Progress         from './pages/student/Progress';
import Payments         from './pages/student/Payments';

// Admin pages
import AdminDashboard   from './pages/admin/Dashboard';
import ManageStudents   from './pages/admin/ManageStudents';
import ManageCourses    from './pages/admin/ManageCourses';
import ManageLessons    from './pages/admin/ManageLessons';
import ManageQuizzes    from './pages/admin/ManageQuizzes';
import AdminPayments    from './pages/admin/Payments';
import AdminAttendance  from './pages/admin/Attendance';
import AdminResources   from './pages/admin/Resources';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((s) => s.auth);

  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      dispatch(fetchMe());
    }
  }, [dispatch]);

  const isAdmin = user?.role === 'admin' || user?.role === 'teacher';

  return (
    <QueryClientProvider client={queryClient}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Public Layout */}
          <Route element={<PublicLayout />}>
            <Route path="/login"    element={!isAuthenticated ? <Login />    : <Navigate to={isAdmin ? '/admin' : '/dashboard'} />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
            <Route path="/"         element={<LandingPage />} />
          </Route>

          {/* Student portal */}
          <Route element={<ProtectedRoute role="student" />}>
            <Route element={<StudentLayout />}>
              <Route path="/dashboard"          element={<StudentDashboard />} />
              <Route path="/my-classes"         element={<MyClasses />} />
              <Route path="/video-vault"        element={<VideoVault />} />
              <Route path="/video-vault/:lessonId" element={<VideoPlayer />} />
              <Route path="/quiz/:quizId"       element={<QuizPage />} />
              <Route path="/assignments"        element={<Assignments />} />
              <Route path="/resources"          element={<Resources />} />
              <Route path="/progress"           element={<Progress />} />
              <Route path="/payments"           element={<Payments />} />
            </Route>
          </Route>

          {/* Admin portal */}
          <Route element={<ProtectedRoute role="admin" />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin"               element={<AdminDashboard />} />
              <Route path="/admin/students"      element={<ManageStudents />} />
              <Route path="/admin/courses"       element={<ManageCourses />} />
              <Route path="/admin/lessons"       element={<ManageLessons />} />
              <Route path="/admin/quizzes"       element={<ManageQuizzes />} />
              <Route path="/admin/payments"      element={<AdminPayments />} />
              <Route path="/admin/attendance"    element={<AdminAttendance />} />
              <Route path="/admin/resources"     element={<AdminResources />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
