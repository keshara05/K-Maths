import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box, AppBar, Toolbar, Typography, Button, Container, Grid, Card, CardContent,
  CardMedia, IconButton, Dialog, DialogContent, DialogTitle, useTheme, Chip, Avatar,
  ToggleButton, ToggleButtonGroup, Tooltip
} from '@mui/material';
import {
  PlayCircleOutline, Language, LightMode, DarkMode, SettingsBrightness,
  School, VideoLibrary, LibraryBooks, HelpOutline, CheckCircle, Phone, Email
} from '@mui/icons-material';
import { useThemeLanguage } from '../context/ThemeLanguageContext';

// Sample Free YouTube Videos list
const FREE_VIDEOS = [
  {
    id: '1',
    titleEn: 'Quadratic Equations - Grade 11 Math',
    titleSi: 'වර්ගජ සමීකරණ - 11 ශ්‍රේණිය',
    descEn: 'Master the methods of solving quadratic equations easily.',
    descSi: 'වර්ගජ සමීකරණ විසඳන සරල ක්‍රම සහ ප්‍රමේයයන් ඉගෙන ගන්න.',
    youtubeId: 'W1j_T6x0yCg',
    grade: '11',
    duration: '45 mins'
  },
  {
    id: '2',
    titleEn: 'Fractions & Percentages - Grade 10 Math',
    titleSi: 'භාග සහ ප්‍රතිශත - 10 ශ්‍රේණිය',
    descEn: 'Clear explanation of fraction operations and percentage tricks.',
    descSi: 'භාග ආශ්‍රිත ගණිත කර්ම සහ ප්‍රතිශත සරලව තේරුම් ගන්න.',
    youtubeId: '3qH1e9D-o4Y',
    grade: '10',
    duration: '35 mins'
  },
  {
    id: '3',
    titleEn: 'Theorem of Pythagoras - Grade 9 Math',
    titleSi: 'පයිතගරස් ප්‍රමේයය - 9 ශ්‍රේණිය',
    descEn: 'Visualizing and applying the famous Pythagorean theorem.',
    descSi: 'පයිතගරස් ප්‍රමේයය ප්‍රායෝගිකව ගැටලු සඳහා භාවිතා කරන ආකාරය.',
    youtubeId: '5aT2uW4vL9I',
    grade: '9',
    duration: '30 mins'
  },
  {
    id: '4',
    titleEn: 'Trigonometry Introduction - Grade 11 Math',
    titleSi: 'ත්‍රිකෝණමිතිය හැඳින්වීම - 11 ශ්‍රේණිය',
    descEn: 'Introduction to Sin, Cos, and Tan ratios for school syllabus.',
    descSi: 'සයින්, කොසයින් සහ ටැන්ජන්ට් අනුපාත හඳුනාගැනීම සහ ගැටලු විසඳීම.',
    youtubeId: 'x4rM4pG9e6c',
    grade: '11',
    duration: '50 mins'
  }
];

const GRADE_INFO = [
  { grade: '6', fee: '1000', day: 'Saturday 8:00 AM', color: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' },
  { grade: '7', fee: '1000', day: 'Saturday 10:30 AM', color: 'linear-gradient(135deg, #10b981 0%, #047857 100%)' },
  { grade: '8', fee: '1200', day: 'Sunday 8:00 AM', color: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)' },
  { grade: '9', fee: '1200', day: 'Sunday 10:30 AM', color: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' },
  { grade: '10', fee: '1500', day: 'Friday 4:00 PM', color: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' },
  { grade: '11', fee: '1500', day: 'Sunday 2:00 PM', color: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { language, setLanguage, themeMode, setThemeMode, resolvedTheme, t } = useThemeLanguage();
  const { isAuthenticated } = useSelector((s) => s.auth);

  // States
  const [activeVideo, setActiveVideo] = useState(null);
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('all');

  const handleWatchVideo = (video) => {
    setActiveVideo(video);
  };

  const handleCloseVideo = () => {
    setActiveVideo(null);
  };

  const filteredVideos = selectedGradeFilter === 'all'
    ? FREE_VIDEOS
    : FREE_VIDEOS.filter(v => v.grade === selectedGradeFilter);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // --- Jelly Animation & Float Keyframes ---
  const fadeInUpStyle = {
    '@keyframes fadeInUp': {
      from: { opacity: 0, transform: 'translateY(30px)' },
      to: { opacity: 1, transform: 'translateY(0)' }
    },
    animation: 'fadeInUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.2) forwards'
  };

  const floatStyle = (delay = '0s') => ({
    '@keyframes float': {
      '0%, 100%': { transform: 'translateY(0px)' },
      '50%': { transform: 'translateY(-12px)' }
    },
    animation: `float 4s ease-in-out infinite`,
    animationDelay: delay
  });

  const floatHorizontalStyle = (delay = '0s') => ({
    '@keyframes floatH': {
      '0%, 100%': { transform: 'translateX(0px) rotate(0deg)' },
      '50%': { transform: 'translateX(10px) rotate(5deg)' }
    },
    animation: `floatH 5s ease-in-out infinite`,
    animationDelay: delay
  });

  const jellyHoverCard = {
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    '&:hover': {
      transform: 'translateY(-8px) scale(1.03)',
      boxShadow: resolvedTheme === 'dark' 
        ? '0 12px 30px rgba(0,0,0,0.6), 0 0 15px rgba(21,101,192,0.3)' 
        : '0 12px 30px rgba(21,101,192,0.15)',
      borderColor: 'primary.light',
    }
  };

  const jellyHoverButton = {
    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    '&:hover': {
      transform: 'scale(1.06)',
      boxShadow: '0 4px 12px rgba(21,101,192,0.3)'
    },
    '&:active': {
      transform: 'scale(0.96)'
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', overflowX: 'hidden' }}>
      {/* ── Premium Glassmorphic Header ──────────────────────────────────────── */}
      <AppBar 
        position="sticky" 
        elevation={0} 
        sx={{ 
          backdropFilter: 'blur(16px)',
          backgroundColor: resolvedTheme === 'dark' ? 'rgba(18, 18, 18, 0.8)' : 'rgba(255, 255, 255, 0.85)',
          borderBottom: `1px solid ${resolvedTheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
          zIndex: theme.zIndex.drawer + 1
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => navigate('/')}>
              <Box sx={{
                width: 38, height: 38, borderRadius: '10px',
                background: 'linear-gradient(135deg, #1565C0 0%, #1E88E5 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 800, color: '#fff',
                boxShadow: '0 2px 8px rgba(21,101,192,0.4)',
                ...jellyHoverButton
              }}>K</Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 0.5 }}>
                {t('landing_title')}
              </Typography>
            </Box>

            {/* Nav items */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              <Button color="inherit" sx={{ borderRadius: 2, px: 2, '&:hover': { bgcolor: 'rgba(21,101,192,0.08)' } }} onClick={() => scrollToSection('features')}>{t('features_title')}</Button>
              <Button color="inherit" sx={{ borderRadius: 2, px: 2, '&:hover': { bgcolor: 'rgba(21,101,192,0.08)' } }} onClick={() => scrollToSection('videos')}>{t('free_videos_title')}</Button>
              <Button color="inherit" sx={{ borderRadius: 2, px: 2, '&:hover': { bgcolor: 'rgba(21,101,192,0.08)' } }} onClick={() => scrollToSection('grades')}>{t('grades_section_title')}</Button>
              <Button color="inherit" sx={{ borderRadius: 2, px: 2, '&:hover': { bgcolor: 'rgba(21,101,192,0.08)' } }} onClick={() => scrollToSection('teacher')}>{t('teacher_title')}</Button>
            </Box>

            {/* Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {/* Language Switcher */}
              <ToggleButtonGroup
                size="small"
                value={language}
                exclusive
                onChange={(_, val) => val && setLanguage(val)}
                aria-label="Language Selector"
                sx={{ bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 2 }}
              >
                <ToggleButton value="en" sx={{ px: 1.2, py: 0.4, border: 'none', borderRadius: 2 }}>EN</ToggleButton>
                <ToggleButton value="si" sx={{ px: 1.2, py: 0.4, border: 'none', borderRadius: 2 }}>සිං</ToggleButton>
              </ToggleButtonGroup>

              {/* Theme Selector */}
              <ToggleButtonGroup
                size="small"
                value={themeMode}
                exclusive
                onChange={(_, val) => val && setThemeMode(val)}
                aria-label="Theme Selector"
                sx={{ bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 2 }}
              >
                <Tooltip title={t('theme_light')}>
                  <ToggleButton value="light" sx={{ p: 0.4, border: 'none' }}><LightMode fontSize="small" /></ToggleButton>
                </Tooltip>
                <Tooltip title={t('theme_dark')}>
                  <ToggleButton value="dark" sx={{ p: 0.4, border: 'none' }}><DarkMode fontSize="small" /></ToggleButton>
                </Tooltip>
                <Tooltip title={t('theme_auto')}>
                  <ToggleButton value="auto" sx={{ p: 0.4, border: 'none' }}><SettingsBrightness fontSize="small" /></ToggleButton>
                </Tooltip>
              </ToggleButtonGroup>

              {/* CTA Auth */}
              {isAuthenticated ? (
                <Button variant="contained" size="small" sx={{ borderRadius: 2, fontWeight: 700, ...jellyHoverButton }} onClick={() => navigate('/dashboard')}>
                  {t('cta_dashboard')}
                </Button>
              ) : (
                <Button variant="contained" size="small" sx={{ borderRadius: 2, fontWeight: 700, ...jellyHoverButton }} onClick={() => navigate('/login')}>
                  {t('login')}
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* ── Captivating Hero Section ────────────────────────────────────────── */}
      <Box sx={{
        position: 'relative',
        background: resolvedTheme === 'dark'
          ? 'radial-gradient(circle at 50% 120%, #1e3a8a 0%, #121212 75%)'
          : 'radial-gradient(circle at 50% 120%, #e0f2fe 0%, #F5F7FA 75%)',
        py: { xs: 10, md: 16 },
        textAlign: 'center',
        borderBottom: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden'
      }}>
        {/* Floating Background Badges */}
        <Box sx={{
          position: 'absolute', top: '15%', left: '10%', opacity: { xs: 0.1, md: 0.2 },
          bgcolor: 'primary.main', color: '#fff', px: 2, py: 1, borderRadius: 2, fontSize: 18, fontWeight: 800,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', ...floatStyle('0s')
        }}>
          √x + y²
        </Box>
        <Box sx={{
          position: 'absolute', top: '55%', right: '12%', opacity: { xs: 0.1, md: 0.25 },
          bgcolor: 'secondary.main', color: '#fff', px: 2.5, py: 1, borderRadius: 3, fontSize: 22, fontWeight: 900,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', ...floatStyle('0.8s')
        }}>
          πr²
        </Box>
        <Box sx={{
          position: 'absolute', bottom: '15%', left: '15%', opacity: { xs: 0.08, md: 0.15 },
          bgcolor: 'success.main', color: '#fff', px: 2, py: 1, borderRadius: '50%', fontSize: 24, fontWeight: 900,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', ...floatHorizontalStyle('0.3s')
        }}>
          sin θ
        </Box>
        <Box sx={{
          position: 'absolute', top: '25%', right: '20%', opacity: { xs: 0.05, md: 0.12 },
          bgcolor: 'warning.main', color: '#fff', px: 2, py: 1, borderRadius: 2, fontSize: 20, fontWeight: 700,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', ...floatHorizontalStyle('1.2s')
        }}>
          a² + b² = c²
        </Box>

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2, ...fadeInUpStyle }}>
          <Chip
            label={t('landing_subtitle')}
            color="primary"
            variant="outlined"
            sx={{ 
              mb: 3, fontWeight: 700, borderRadius: 5, px: 2, py: 1.5,
              borderColor: 'primary.main', bgcolor: resolvedTheme === 'dark' ? 'rgba(21,101,192,0.1)' : 'rgba(21,101,192,0.05)'
            }}
          />
          <Typography variant="h2" component="h1" sx={{
            fontWeight: 900,
            mb: 2,
            background: 'linear-gradient(45deg, #1565C0 20%, #F57C00 80%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '2.8rem', md: '4.2rem' },
            letterSpacing: -1
          }}>
            {language === 'en' ? 'Master O/L Mathematics' : 'සාමාන්‍ය පෙළ ගණිතය ජයගන්න'}
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 6, fontWeight: 400, maxWidth: '650px', mx: 'auto', lineHeight: 1.6 }}>
            {t('landing_tagline')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              size="large" 
              startIcon={<School />} 
              sx={{ borderRadius: 3, px: 4, py: 1.8, fontSize: 16, fontWeight: 700, ...jellyHoverButton }}
              onClick={() => navigate('/register')}
            >
              {t('cta_join_now')}
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              startIcon={<PlayCircleOutline />} 
              sx={{ borderRadius: 3, px: 4, py: 1.8, fontSize: 16, fontWeight: 700, ...jellyHoverButton }}
              onClick={() => scrollToSection('videos')}
            >
              {t('cta_free_videos')}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ── Features Section ────────────────────────────────────────────────── */}
      <Container maxWidth="lg" id="features" sx={{ py: 12 }}>
        <Typography variant="h4" textAlign="center" fontWeight={900} mb={2}>
          {t('features_title')}
        </Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary" mb={8} sx={{ maxWidth: 500, mx: 'auto' }}>
          {language === 'en' ? 'Experience structured learning with comprehensive systems designed to deliver grade results.' : 'ඉහළ ප්‍රතිඵලයක් ළඟා කර දීම සඳහාම විශේෂයෙන් සැකසූ ක්‍රමවත් ඉගෙනුම් අත්දැකීම.'}
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 3, ...jellyHoverCard }}>
              <CardContent>
                <Avatar sx={{ bgcolor: 'primary.light', width: 60, height: 60, mx: 'auto', mb: 3, boxShadow: '0 4px 10px rgba(30,136,229,0.3)' }}>
                  <School fontSize="large" sx={{ color: '#fff' }} />
                </Avatar>
                <Typography variant="h6" fontWeight={700} gutterBottom>{t('features_live_title')}</Typography>
                <Typography variant="body2" color="text.secondary" lineHeight={1.6}>{t('features_live_desc')}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 3, ...jellyHoverCard }}>
              <CardContent>
                <Avatar sx={{ bgcolor: 'secondary.light', width: 60, height: 60, mx: 'auto', mb: 3, boxShadow: '0 4px 10px rgba(255,167,38,0.3)' }}>
                  <VideoLibrary fontSize="large" sx={{ color: '#fff' }} />
                </Avatar>
                <Typography variant="h6" fontWeight={700} gutterBottom>{t('features_videos_title')}</Typography>
                <Typography variant="body2" color="text.secondary" lineHeight={1.6}>{t('features_videos_desc')}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 3, ...jellyHoverCard }}>
              <CardContent>
                <Avatar sx={{ bgcolor: 'success.light', width: 60, height: 60, mx: 'auto', mb: 3, boxShadow: '0 4px 10px rgba(46,125,50,0.3)' }}>
                  <LibraryBooks fontSize="large" sx={{ color: '#fff' }} />
                </Avatar>
                <Typography variant="h6" fontWeight={700} gutterBottom>{t('features_resources_title')}</Typography>
                <Typography variant="body2" color="text.secondary" lineHeight={1.6}>{t('features_resources_desc')}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 3, ...jellyHoverCard }}>
              <CardContent>
                <Avatar sx={{ bgcolor: 'warning.light', width: 60, height: 60, mx: 'auto', mb: 3, boxShadow: '0 4px 10px rgba(249,168,37,0.3)' }}>
                  <HelpOutline fontSize="large" sx={{ color: '#fff' }} />
                </Avatar>
                <Typography variant="h6" fontWeight={700} gutterBottom>{t('features_quizzes_title')}</Typography>
                <Typography variant="body2" color="text.secondary" lineHeight={1.6}>{t('features_quizzes_desc')}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* ── Free Video Vault Section ─────────────────────────────────────────── */}
      <Box sx={{ bgcolor: resolvedTheme === 'dark' ? '#18181b' : '#f1f5f9', py: 10, borderTop: `1px solid ${theme.palette.divider}`, borderBottom: `1px solid ${theme.palette.divider}` }} id="videos">
        <Container maxWidth="lg">
          <Typography variant="h4" textAlign="center" fontWeight={900} mb={1}>
            {t('free_videos_title')}
          </Typography>
          <Typography variant="body1" textAlign="center" color="text.secondary" mb={5}>
            {t('free_videos_subtitle')}
          </Typography>

          {/* Filter */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mb: 5, flexWrap: 'wrap' }}>
            <ToggleButtonGroup
              size="small"
              value={selectedGradeFilter}
              exclusive
              onChange={(_, v) => v && setSelectedGradeFilter(v)}
              sx={{ bgcolor: 'background.paper', p: 0.5, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
            >
              <ToggleButton value="all" sx={{ px: 2, border: 'none', borderRadius: 2 }}>{language === 'en' ? 'All Grades' : 'සියලුම ශ්‍රේණි'}</ToggleButton>
              <ToggleButton value="9" sx={{ px: 2, border: 'none', borderRadius: 2 }}>Grade 9</ToggleButton>
              <ToggleButton value="10" sx={{ px: 2, border: 'none', borderRadius: 2 }}>Grade 10</ToggleButton>
              <ToggleButton value="11" sx={{ px: 2, border: 'none', borderRadius: 2 }}>Grade 11</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Videos Grid */}
          <Grid container spacing={3.5}>
            {filteredVideos.map((video) => (
              <Grid item xs={12} sm={6} md={3} key={video.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', ...jellyHoverCard }}>
                  <Box sx={{ position: 'relative', pt: '56.25%', cursor: 'pointer' }} onClick={() => handleWatchVideo(video)}>
                    <CardMedia
                      component="img"
                      image={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                      alt={video.titleEn}
                      sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transition: 'all 0.5s ease', '&:hover': { transform: 'scale(1.08)' } }}
                    />
                    <Box sx={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      bgcolor: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: 0.8, transition: 'all 0.3s ease', '&:hover': { opacity: 1, bgcolor: 'rgba(0,0,0,0.1)' }
                    }}>
                      <PlayCircleOutline sx={{ fontSize: 56, color: '#ffffff', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }} />
                    </Box>
                    <Chip
                      label={`Grade ${video.grade}`}
                      color="secondary"
                      size="small"
                      sx={{ position: 'absolute', top: 12, left: 12, fontWeight: 800, borderRadius: 1.5, px: 0.5 }}
                    />
                  </Box>
                  <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                    <Typography variant="subtitle1" fontWeight={700} gutterBottom lineHeight={1.4}>
                      {language === 'en' ? video.titleEn : video.titleSi}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" lineHeight={1.5}>
                      {language === 'en' ? video.descEn : video.descSi}
                    </Typography>
                  </CardContent>
                  <Box sx={{ p: 2, px: 2.5, borderTop: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>{video.duration}</Typography>
                    <Button size="small" variant="text" sx={{ fontWeight: 700, borderRadius: 2 }} onClick={() => handleWatchVideo(video)}>
                      {t('watch_now')}
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Math Programs / Grades Section ───────────────────────────────────── */}
      <Container maxWidth="lg" id="grades" sx={{ py: 12 }}>
        <Typography variant="h4" textAlign="center" fontWeight={900} mb={1}>
          {t('grades_section_title')}
        </Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary" mb={8}>
          {t('grades_section_subtitle')}
        </Typography>

        <Grid container spacing={4}>
          {GRADE_INFO.map((g) => (
            <Grid item xs={12} sm={6} md={4} key={g.grade}>
              <Card sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderTop: 'none',
                overflow: 'hidden',
                position: 'relative',
                ...jellyHoverCard
              }}>
                {/* Header gradient banner */}
                <Box sx={{ background: g.color, height: '8px' }} />

                <CardContent sx={{ flexGrow: 1, p: 4 }}>
                  <Typography variant="h5" fontWeight={850} gutterBottom mb={2}>
                    {t('grade_card_title', { grade: g.grade })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={4} lineHeight={1.6}>
                    {t('grade_card_desc', { grade: g.grade })}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <CheckCircle fontSize="small" sx={{ color: 'primary.main' }} />
                      <Typography variant="body2" fontWeight={600}>{t('class_time')}: {g.day}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <CheckCircle fontSize="small" sx={{ color: 'primary.main' }} />
                      <Typography variant="body2" fontWeight={600}>English & Sinhala Medium</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <CheckCircle fontSize="small" sx={{ color: 'primary.main' }} />
                      <Typography variant="body2" fontWeight={600}>Online Live + Recorded Access</Typography>
                    </Box>
                  </Box>
                </CardContent>
                <Box sx={{ p: 4, bgcolor: resolvedTheme === 'dark' ? '#27272a' : '#f8fafc', display: 'flex', flexDirection: 'column', gap: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="h5" fontWeight={800} color="secondary.main" textAlign="center">
                    {t('grade_fee', { fee: g.fee })}
                  </Typography>
                  <Button variant="contained" fullWidth sx={{ borderRadius: 3, py: 1.5, fontWeight: 700, ...jellyHoverButton }} onClick={() => navigate('/register')}>
                    {t('cta_join_now')}
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ── Teacher Section ─────────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: resolvedTheme === 'dark' ? '#18181b' : '#f8fafc', py: 10, borderTop: `1px solid ${theme.palette.divider}`, borderBottom: `1px solid ${theme.palette.divider}` }} id="teacher">
        <Container maxWidth="md">
          <Card sx={{ p: { xs: 4, md: 6 }, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 5, ...jellyHoverCard }}>
            <Avatar
              sx={{ 
                width: 140, height: 140, bgcolor: 'primary.main', fontSize: 48, fontWeight: 800,
                boxShadow: '0 8px 24px rgba(21,101,192,0.3)',
                background: 'linear-gradient(135deg, #0d47a1 0%, #1e88e5 100%)'
              }}
            >
              KM
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={900} gutterBottom>{t('teacher_title')}</Typography>
              <Typography variant="subtitle1" color="primary.main" fontWeight={750} mb={2.5}>
                K-Maths Founder & Lead Mathematics Tutor
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                {t('teacher_desc')}
              </Typography>
            </Box>
          </Card>
        </Container>
      </Box>

      {/* ── Contact Details ─────────────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Grid container spacing={6} justifyContent="center" alignItems="center">
          <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="h4" fontWeight={900} mb={2}>
              {language === 'en' ? 'Get In Touch' : 'අප හා සම්බන්ධ වන්න'}
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={5} sx={{ maxWidth: 450, mx: { xs: 'auto', md: '0' } }}>
              {language === 'en'
                ? 'Have questions about classes, payment, or schedules? Contact us directly.'
                : 'පන්ති, ගෙවීම් හෝ කාලසටහන් පිළිබඳව ප්‍රශ්න තිබේද? අප හා සෘජුවම සම්බන්ධ වන්න.'}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, alignItems: { xs: 'center', md: 'flex-start' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                <Avatar sx={{ bgcolor: 'primary.main', boxShadow: '0 4px 10px rgba(21,101,192,0.2)' }}><Phone /></Avatar>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="caption" display="block" color="text.secondary" fontWeight={600}>Hotline</Typography>
                  <Typography variant="body1" fontWeight={800}>+94 77 123 4567</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                <Avatar sx={{ bgcolor: 'primary.main', boxShadow: '0 4px 10px rgba(21,101,192,0.2)' }}><Email /></Avatar>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="caption" display="block" color="text.secondary" fontWeight={600}>Email Address</Typography>
                  <Typography variant="body1" fontWeight={800}>info@k-maths.lk</Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: resolvedTheme === 'dark' ? '#09090b' : '#0f172a', color: '#94a3b8', py: 6, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color="#ffffff" fontWeight={800} gutterBottom>
            {t('landing_title')}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
            {t('footer_text')}
          </Typography>
        </Container>
      </Box>

      {/* ── YouTube Video Player Dialog ─────────────────────────────────────── */}
      <Dialog
        open={Boolean(activeVideo)}
        onClose={handleCloseVideo}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
            bgcolor: '#000000',
            color: '#ffffff',
            boxShadow: '0 10px 40px rgba(0,0,0,0.8)'
          }
        }}
      >
        {activeVideo && (
          <>
            <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.paper', color: 'text.primary', borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="h6" fontWeight={800}>
                {language === 'en' ? activeVideo.titleEn : activeVideo.titleSi}
              </Typography>
              <Button size="small" onClick={handleCloseVideo} variant="outlined" sx={{ borderRadius: 2, fontWeight: 700 }}>{t('close')}</Button>
            </DialogTitle>
            <DialogContent sx={{ p: 0, position: 'relative', pt: '56.25%', width: '100%' }}>
              <iframe
                title={activeVideo.titleEn}
                src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  border: 'none'
                }}
              />
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}
