import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, Grid, MenuItem, CircularProgress, InputAdornment, IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, School } from '@mui/icons-material';
import { registerUser, clearError } from '../../app/slices/authSlice';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';

const GRADES = [6, 7, 8, 9, 10, 11, 12, 13];

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const { t, language, resolvedTheme } = useThemeLanguage();

  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', password: '', grade: '', school: '',
  });

  const handleChange = (e) => {
    dispatch(clearError());
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, grade: form.grade ? Number(form.grade) : undefined };
    const result = await dispatch(registerUser(payload));
    if (registerUser.fulfilled.match(result)) navigate('/dashboard');
  };

  const jellyHoverButton = {
    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    '&:hover': {
      transform: 'scale(1.02)',
      boxShadow: '0 6px 15px rgba(21,101,192,0.3)'
    },
    '&:active': {
      transform: 'scale(0.98)'
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: resolvedTheme === 'dark' 
        ? 'radial-gradient(circle at 50% 50%, #0f172a 0%, #020617 100%)' 
        : 'radial-gradient(circle at 50% 50%, #f0fdf4 0%, #ecfdf5 100%)',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      p: 2.5,
      position: 'relative',
      overflowX: 'hidden',
      py: { xs: 8, md: 10 } // Give space for top fixed header on scroll
    }}>
      
      {/* ── Ambient Glowing Background Blobs ── */}
      <Box sx={{
        position: 'absolute', top: '5%', left: '-5%', width: { xs: 200, md: 400 }, height: { xs: 200, md: 400 },
        borderRadius: '50%',
        background: resolvedTheme === 'dark' ? 'radial-gradient(circle, rgba(21,101,192,0.15) 0%, rgba(0,0,0,0) 70%)' : 'radial-gradient(circle, rgba(186,230,253,0.35) 0%, rgba(255,255,255,0) 70%)',
        filter: 'blur(70px)', zIndex: 0, pointerEvents: 'none',
      }} />
      <Box sx={{
        position: 'absolute', bottom: '5%', right: '-5%', width: { xs: 220, md: 450 }, height: { xs: 220, md: 450 },
        borderRadius: '50%',
        background: resolvedTheme === 'dark' ? 'radial-gradient(circle, rgba(245,124,0,0.1) 0%, rgba(0,0,0,0) 70%)' : 'radial-gradient(circle, rgba(254,215,170,0.3) 0%, rgba(255,255,255,0) 70%)',
        filter: 'blur(85px)', zIndex: 0, pointerEvents: 'none',
      }} />

      {/* Floating Math Symbols */}
      <Box sx={{
        position: 'absolute', top: '15%', left: '12%', opacity: 0.12,
        fontSize: '2.5rem', fontWeight: 900, pointerEvents: 'none', userSelect: 'none',
        color: 'primary.main', display: { xs: 'none', sm: 'block' }
      }}>
        x² - 4 = 0
      </Box>
      <Box sx={{
        position: 'absolute', bottom: '15%', right: '12%', opacity: 0.12,
        fontSize: '2.5rem', fontWeight: 900, pointerEvents: 'none', userSelect: 'none',
        color: 'secondary.main', display: { xs: 'none', sm: 'block' }
      }}>
        f(x) = sin(x)
      </Box>

      {/* ── Frosted-Glass Card ── */}
      <Card sx={{ 
        width: '100%', 
        maxWidth: 480, 
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
              {t('register')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {language === 'en' ? 'Create your student account' : 'නව ගිණුමක් සාදා ගන්න'}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }} onClose={() => dispatch(clearError())}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label={t('full_name')} 
                  name="full_name" 
                  value={form.full_name} 
                  onChange={handleChange} 
                  required 
                  autoFocus
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                      bgcolor: resolvedTheme === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.5)',
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label={t('email')} 
                  name="email" 
                  type="email" 
                  value={form.email} 
                  onChange={handleChange} 
                  required 
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                      bgcolor: resolvedTheme === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.5)',
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label={t('phone')} 
                  name="phone" 
                  value={form.phone} 
                  onChange={handleChange} 
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                      bgcolor: resolvedTheme === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.5)',
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  select 
                  label={t('grade')} 
                  name="grade" 
                  value={form.grade} 
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                      bgcolor: resolvedTheme === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.5)',
                    }
                  }}
                >
                  <MenuItem value="">{language === 'en' ? 'Select grade' : 'ශ්‍රේණිය තෝරන්න'}</MenuItem>
                  {GRADES.map((g) => <MenuItem key={g} value={g}>Grade {g}</MenuItem>)}
                </TextField>
              </Grid>
              
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label={t('school')} 
                  name="school" 
                  value={form.school} 
                  onChange={handleChange} 
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                      bgcolor: resolvedTheme === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.5)',
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth 
                  label={t('password')} 
                  name="password" 
                  value={form.password}
                  type={showPwd ? 'text' : 'password'} 
                  onChange={handleChange} 
                  required
                  helperText={language === 'en' ? 'Minimum 8 characters' : 'අවම වශයෙන් අක්ෂර 8ක්'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                      bgcolor: resolvedTheme === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.5)',
                    }
                  }}
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
              </Grid>
              
              <Grid item xs={12} sx={{ mt: 1 }}>
                <Button
                  fullWidth 
                  variant="contained" 
                  type="submit" 
                  size="large"
                  disabled={loading} 
                  sx={{ py: 1.6, borderRadius: 2.5, fontWeight: 700, ...jellyHoverButton }}
                  startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
                >
                  {loading ? t('loading') : t('register')}
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              {language === 'en' ? 'Already have an account? ' : 'දැනටමත් ගිණුමක් තිබේද? '}
              <Link to="/login" style={{ color: '#1565C0', fontWeight: 700, textDecoration: 'none' }}>
                {t('login')}
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
