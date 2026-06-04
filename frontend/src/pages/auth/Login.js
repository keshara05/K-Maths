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
  const { t, language, resolvedTheme } = useThemeLanguage();

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

  const jellyHoverButton = {
    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    '&:hover': {
      transform: 'scale(1.03)',
      boxShadow: '0 6px 15px rgba(21,101,192,0.3)'
    },
    '&:active': {
      transform: 'scale(0.97)'
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: resolvedTheme === 'dark' 
        ? 'radial-gradient(circle at 50% 50%, #0f172a 0%, #020617 100%)' 
        : 'radial-gradient(circle at 50% 50%, #f0fdf4 0%, #ecfdf5 100%)', // Subtle green-blue gradient
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      p: 2.5,
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* ── Ambient Glowing Background Blobs ── */}
      <Box sx={{
        position: 'absolute', top: '10%', left: '-5%', width: { xs: 220, md: 400 }, height: { xs: 220, md: 400 },
        borderRadius: '50%',
        background: resolvedTheme === 'dark' ? 'radial-gradient(circle, rgba(21,101,192,0.15) 0%, rgba(0,0,0,0) 70%)' : 'radial-gradient(circle, rgba(186,230,253,0.35) 0%, rgba(255,255,255,0) 70%)',
        filter: 'blur(70px)', zIndex: 0, pointerEvents: 'none',
      }} />
      <Box sx={{
        position: 'absolute', bottom: '10%', right: '-5%', width: { xs: 250, md: 450 }, height: { xs: 250, md: 450 },
        borderRadius: '50%',
        background: resolvedTheme === 'dark' ? 'radial-gradient(circle, rgba(245,124,0,0.1) 0%, rgba(0,0,0,0) 70%)' : 'radial-gradient(circle, rgba(254,215,170,0.3) 0%, rgba(255,255,255,0) 70%)',
        filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none',
      }} />

      {/* Floating Math Symbols */}
      <Box sx={{
        position: 'absolute', top: '20%', right: '15%', opacity: 0.12,
        fontSize: '2.5rem', fontWeight: 900, pointerEvents: 'none', userSelect: 'none',
        color: 'primary.main', display: { xs: 'none', sm: 'block' }
      }}>
        √x + y² = z
      </Box>
      <Box sx={{
        position: 'absolute', bottom: '20%', left: '15%', opacity: 0.12,
        fontSize: '2.5rem', fontWeight: 900, pointerEvents: 'none', userSelect: 'none',
        color: 'secondary.main', display: { xs: 'none', sm: 'block' }
      }}>
        π ≈ 3.14
      </Box>

      {/* ── Frosted-Glass Card ── */}
      <Card sx={{ 
        width: '100%', 
        maxWidth: 420, 
        borderRadius: 5,
        zIndex: 1,
        backdropFilter: 'blur(24px)',
        bgcolor: resolvedTheme === 'dark' ? 'rgba(30, 41, 59, 0.45)' : 'rgba(255, 255, 255, 0.55)',
        border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(21,101,192,0.1)'}`,
        boxShadow: resolvedTheme === 'dark' 
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.05)' 
          : '0 25px 50px -12px rgba(21,101,192,0.08)',
        transition: 'all 0.3s ease'
      }}>
        <CardContent sx={{ p: { xs: 3.5, sm: 4.5 } }}>
          
          {/* Header Icon & Intro */}
          <Box sx={{ textAlign: 'center', mb: 3.5 }}>
            <Box sx={{ 
              width: 58, height: 58, borderRadius: '16px', 
              background: 'linear-gradient(135deg, #1565C0, #1E88E5)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              mx: 'auto', mb: 2,
              boxShadow: '0 4px 14px rgba(21,101,192,0.3)'
            }}>
              <School sx={{ color: '#fff', fontSize: 28 }} />
            </Box>
            <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: -0.5 }}>
              {t('welcome')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {language === 'en' ? 'Sign in to your K-Maths Account' : 'කේ-මැත්ස් ගිණුමට ඇතුල් වන්න'}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => dispatch(clearError())}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth 
              label={t('email')} 
              name="email" 
              type="email"
              value={form.email} 
              onChange={handleChange}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                  bgcolor: resolvedTheme === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.5)',
                }
              }} 
              autoComplete="email" 
              autoFocus 
              required
            />
            <TextField
              fullWidth 
              label={t('password')} 
              name="password"
              type={showPwd ? 'text' : 'password'}
              value={form.password} 
              onChange={handleChange}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                  bgcolor: resolvedTheme === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.5)',
                }
              }} 
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPwd(!showPwd)} edge="end" size="small">
                      {showPwd ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              fullWidth 
              variant="contained" 
              type="submit" 
              size="large"
              disabled={loading} 
              sx={{ mb: 2.5, py: 1.6, borderRadius: 2.5, fontWeight: 700, ...jellyHoverButton }}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
            >
              {loading ? t('loading') : t('login')}
            </Button>
          </Box>

          <Divider sx={{ my: 2.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              {language === 'en' ? 'New to K-Maths?' : 'කේ-මැත්ස් වෙත අලුත්ද?'}
            </Typography>
          </Divider>

          <Button 
            fullWidth 
            variant="outlined" 
            component={Link} 
            to="/register"
            sx={{ 
              py: 1.4, 
              borderRadius: 2.5, 
              fontWeight: 700,
              borderWidth: '1.5px',
              '&:hover': { borderWidth: '1.5px' }
            }}
          >
            {t('register')}
          </Button>

          {/* Demo account tooltip helper */}
          <Box sx={{ 
            mt: 3, 
            p: 2, 
            bgcolor: resolvedTheme === 'dark' ? 'rgba(21,101,192,0.1)' : '#E3F2FD', 
            borderRadius: 2.5,
            borderLeft: `3px solid ${theme => theme.palette.primary.main}`
          }}>
            <Typography variant="caption" color="primary.main" display="block" fontWeight={700} sx={{ mb: 0.5 }}>
              {language === 'en' ? 'Demo Account Details' : 'නිරූපණ ගිණුම් විස්තර'}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {language === 'en' ? 'Email: admin@k-maths.lk' : 'විද්‍යුත් තැපෑල: admin@k-maths.lk'}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {language === 'en' ? 'Password: Admin@123' : 'මුරපදය: Admin@123'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
