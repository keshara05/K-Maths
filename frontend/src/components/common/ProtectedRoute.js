import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = ({ role }) => {
  const { isAuthenticated, user, loading } = useSelector((s) => s.auth);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  if (role === 'admin' && user.role === 'student') return <Navigate to="/dashboard" replace />;
  if (role === 'student' && (user.role === 'admin' || user.role === 'teacher'))
    return <Navigate to="/admin" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
