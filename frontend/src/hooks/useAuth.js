import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, logoutUser, clearError } from '../app/slices/authSlice';

export const useAuth = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user, isAuthenticated, loading, error } = useSelector((s) => s.auth);

  const login = async (credentials) => {
    const result = await dispatch(loginUser(credentials));
    if (loginUser.fulfilled.match(result)) {
      const role = result.payload.user.role;
      navigate(role === 'admin' || role === 'teacher' ? '/admin' : '/dashboard', { replace: true });
    }
    return result;
  };

  const register = async (data) => {
    const result = await dispatch(registerUser(data));
    if (registerUser.fulfilled.match(result)) navigate('/dashboard', { replace: true });
    return result;
  };

  const logout = async () => {
    await dispatch(logoutUser());
    navigate('/login', { replace: true });
  };

  const isAdmin   = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';

  return { user, isAuthenticated, loading, error, isAdmin, isTeacher, isStudent, login, register, logout, clearError: () => dispatch(clearError()) };
};
