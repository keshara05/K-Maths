import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, InputAdornment, IconButton, CircularProgress, Divider,
} from '@mui/material';
import { Visibility, VisibilityOff, School } from '@mui/icons-material';
import { loginUser, clearError } from '../../app/slices/authSlice';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const { t, language } = useThemeLanguage();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = (e) => {
    dispatch(clearError());
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      const role = result.payload.user.role;
      navigate(role === 'student' ? '/dashboard' : '/admin');
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #1E88E5 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2,
    }}>
      <Card sx={{ width: '100%', maxWidth: 420, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{ width: 64, height: 64, borderRadius: 3, background: 'linear-gradient(135deg, #0D47A1, #1E88E5)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
              <School sx={{ color: '#fff', fontSize: 32 }} />
            </Box>
            <Typography variant="h5" fontWeight={700}>{t('welcome')}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {language === 'en' ? 'Sign in to K-Maths' : 'කේ-මැත්ස් පද්ධතියට ඇතුල් වන්න'}
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth label={t('email')} name="email" type="email"
              value={form.email} onChange={handleChange}
              sx={{ mb: 2 }} autoComplete="email" autoFocus required
            />
            <TextField
              fullWidth label={t('password')} name="password"
              type={showPwd ? 'text' : 'password'}
              value={form.password} onChange={handleChange}
              sx={{ mb: 2.5 }} required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPwd(!showPwd)} edge="end" size="small">
                      {showPwd ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              fullWidth variant="contained" type="submit" size="large"
              disabled={loading} sx={{ mb: 2, py: 1.5 }}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
            >
              {loading ? t('loading') : t('login')}
            </Button>
          </Box>

          <Divider sx={{ my: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {language === 'en' ? 'New to K-Maths?' : 'කේ-මැත්ස් වෙත අලුත්ද?'}
            </Typography>
          </Divider>

          <Button fullWidth variant="outlined" component={Link} to="/register">
            {t('register')}
          </Button>

          {/* Demo credentials hint */}
          <Box sx={{ mt: 2.5, p: 1.5, bgcolor: '#E3F2FD', borderRadius: 1.5 }}>
            <Typography variant="caption" color="primary.dark" display="block" fontWeight={600}>
              {language === 'en' ? 'Demo credentials' : 'නිරූපණ ගිණුම් විස්තර'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {language === 'en' ? 'Admin: admin@k-maths.lk / Admin@123' : 'පරිපාලක: admin@k-maths.lk / Admin@123'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
