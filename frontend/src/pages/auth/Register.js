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
  const { t, language } = useThemeLanguage();

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

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #1E88E5 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2,
    }}>
      <Card sx={{ width: '100%', maxWidth: 480, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{ width: 56, height: 56, borderRadius: 3, background: 'linear-gradient(135deg, #0D47A1, #1E88E5)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5 }}>
              <School sx={{ color: '#fff', fontSize: 28 }} />
            </Box>
            <Typography variant="h5" fontWeight={700}>{t('register')}</Typography>
            <Typography variant="body2" color="text.secondary">
              {language === 'en' ? 'Join K-Maths today' : 'අදම කේ-මැත්ස් සමඟ සම්බන්ධ වන්න'}
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label={t('full_name')} name="full_name" value={form.full_name} onChange={handleChange} required autoFocus />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label={t('email')} name="email" type="email" value={form.email} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label={t('phone')} name="phone" value={form.phone} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth select label={t('grade')} name="grade" value={form.grade} onChange={handleChange}>
                  <MenuItem value="">{language === 'en' ? 'Select grade' : 'ශ්‍රේණිය තෝරන්න'}</MenuItem>
                  {GRADES.map((g) => <MenuItem key={g} value={g}>Grade {g}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label={t('school')} name="school" value={form.school} onChange={handleChange} />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth label={t('password')} name="password" value={form.password}
                  type={showPwd ? 'text' : 'password'} onChange={handleChange} required
                  helperText={language === 'en' ? 'Minimum 8 characters' : 'අවම වශයෙන් අක්ෂර 8ක්'}
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
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth variant="contained" type="submit" size="large"
                  disabled={loading} sx={{ py: 1.5 }}
                  startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
                >
                  {loading ? t('loading') : t('register')}
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {language === 'en' ? 'Already have an account? ' : 'දැනටමත් ගිණුමක් තිබේද? '}
              <Link to="/login" style={{ color: '#1565C0', fontWeight: 600 }}>{t('login')}</Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
