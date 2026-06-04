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
    youtubeId: 'W1j_T6x0yCg', // placeholder math related or clean video id
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
  { grade: '6', fee: '1000', day: 'Saturday 8:00 AM' },
  { grade: '7', fee: '1000', day: 'Saturday 10:30 AM' },
  { grade: '8', fee: '1200', day: 'Sunday 8:00 AM' },
  { grade: '9', fee: '1200', day: 'Sunday 10:30 AM' },
  { grade: '10', fee: '1500', day: 'Friday 4:00 PM' },
  { grade: '11', fee: '1500', day: 'Sunday 2:00 PM' },
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

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      {/* ── App Header ──────────────────────────────────────────────────────── */}
      <AppBar position="sticky" elevation={2} color="default" sx={{ bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => navigate('/')}>
              <Box sx={{
                width: 38, height: 38, borderRadius: 2,
                background: 'linear-gradient(135deg, #1565C0 0%, #1E88E5 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 700, color: '#fff',
              }}>K</Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 0.5 }}>
                {t('landing_title')}
              </Typography>
            </Box>

            {/* Nav items */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3 }}>
              <Button color="inherit" onClick={() => scrollToSection('features')}>{t('features_title')}</Button>
              <Button color="inherit" onClick={() => scrollToSection('videos')}>{t('free_videos_title')}</Button>
              <Button color="inherit" onClick={() => scrollToSection('grades')}>{t('grades_section_title')}</Button>
              <Button color="inherit" onClick={() => scrollToSection('teacher')}>{t('teacher_title')}</Button>
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
              >
                <ToggleButton value="en" sx={{ px: 1.5, py: 0.5 }}>EN</ToggleButton>
                <ToggleButton value="si" sx={{ px: 1.5, py: 0.5 }}>සිං</ToggleButton>
              </ToggleButtonGroup>

              {/* Theme Selector */}
              <ToggleButtonGroup
                size="small"
                value={themeMode}
                exclusive
                onChange={(_, val) => val && setThemeMode(val)}
                aria-label="Theme Selector"
              >
                <Tooltip title={t('theme_light')}>
                  <ToggleButton value="light" sx={{ p: 0.5 }}><LightMode fontSize="small" /></ToggleButton>
                </Tooltip>
                <Tooltip title={t('theme_dark')}>
                  <ToggleButton value="dark" sx={{ p: 0.5 }}><DarkMode fontSize="small" /></ToggleButton>
                </Tooltip>
                <Tooltip title={t('theme_auto')}>
                  <ToggleButton value="auto" sx={{ p: 0.5 }}><SettingsBrightness fontSize="small" /></ToggleButton>
                </Tooltip>
              </ToggleButtonGroup>

              {/* CTA Auth */}
              {isAuthenticated ? (
                <Button variant="contained" size="small" onClick={() => navigate('/dashboard')}>
                  {t('cta_dashboard')}
                </Button>
              ) : (
                <Button variant="contained" size="small" onClick={() => navigate('/login')}>
                  {t('login')}
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* ── Hero Banner Section ─────────────────────────────────────────────── */}
      <Box sx={{
        background: resolvedTheme === 'dark'
          ? 'radial-gradient(circle at 50% 120%, #1e3a8a 0%, #121212 70%)'
          : 'radial-gradient(circle at 50% 120%, #e0f2fe 0%, #F5F7FA 70%)',
        py: { xs: 8, md: 12 },
        textAlign: 'center',
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Container maxWidth="md">
          <Chip
            label={t('landing_subtitle')}
            color="primary"
            variant="outlined"
            sx={{ mb: 3, fontWeight: 700, borderRadius: 5, px: 1 }}
          />
          <Typography variant="h2" component="h1" sx={{
            fontWeight: 800,
            mb: 2,
            background: 'linear-gradient(45deg, #1565C0 30%, #F57C00 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '2.5rem', md: '3.75rem' }
          }}>
            {language === 'en' ? 'Master O/L Mathematics' : 'සාමාන්‍ය පෙළ ගණිතය ජයගන්න'}
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 5, fontWeight: 400, maxWidth: '700px', mx: 'auto' }}>
            {t('landing_tagline')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2.5, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="contained" size="large" startIcon={<School />} onClick={() => navigate('/register')}>
              {t('cta_join_now')}
            </Button>
            <Button variant="outlined" size="large" startIcon={<PlayCircleOutline />} onClick={() => scrollToSection('videos')}>
              {t('cta_free_videos')}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ── Features Section ────────────────────────────────────────────────── */}
      <Container maxWidth="lg" id="features" sx={{ py: 8 }}>
        <Typography variant="h4" textAlign="center" fontWeight={800} mb={6}>
          {t('features_title')}
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
              <CardContent>
                <Avatar sx={{ bgcolor: 'primary.light', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                  <School fontSize="large" sx={{ color: '#fff' }} />
                </Avatar>
                <Typography variant="h6" fontWeight={700} gutterBottom>{t('features_live_title')}</Typography>
                <Typography variant="body2" color="text.secondary">{t('features_live_desc')}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
              <CardContent>
                <Avatar sx={{ bgcolor: 'secondary.light', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                  <VideoLibrary fontSize="large" sx={{ color: '#fff' }} />
                </Avatar>
                <Typography variant="h6" fontWeight={700} gutterBottom>{t('features_videos_title')}</Typography>
                <Typography variant="body2" color="text.secondary">{t('features_videos_desc')}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
              <CardContent>
                <Avatar sx={{ bgcolor: 'success.light', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                  <LibraryBooks fontSize="large" sx={{ color: '#fff' }} />
                </Avatar>
                <Typography variant="h6" fontWeight={700} gutterBottom>{t('features_resources_title')}</Typography>
                <Typography variant="body2" color="text.secondary">{t('features_resources_desc')}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
              <CardContent>
                <Avatar sx={{ bgcolor: 'warning.light', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                  <HelpOutline fontSize="large" sx={{ color: '#fff' }} />
                </Avatar>
                <Typography variant="h6" fontWeight={700} gutterBottom>{t('features_quizzes_title')}</Typography>
                <Typography variant="body2" color="text.secondary">{t('features_quizzes_desc')}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* ── Free Video Vault Section ─────────────────────────────────────────── */}
      <Box sx={{ bgcolor: resolvedTheme === 'dark' ? '#18181b' : '#f1f5f9', py: 8 }} id="videos">
        <Container maxWidth="lg">
          <Typography variant="h4" textAlign="center" fontWeight={800} mb={1}>
            {t('free_videos_title')}
          </Typography>
          <Typography variant="body1" textAlign="center" color="text.secondary" mb={5}>
            {t('free_videos_subtitle')}
          </Typography>

          {/* Filter */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mb: 4, flexWrap: 'wrap' }}>
            <ToggleButtonGroup
              size="small"
              value={selectedGradeFilter}
              exclusive
              onChange={(_, v) => v && setSelectedGradeFilter(v)}
            >
              <ToggleButton value="all">{language === 'en' ? 'All Grades' : 'සියලුම ශ්‍රේණි'}</ToggleButton>
              <ToggleButton value="9">Grade 9</ToggleButton>
              <ToggleButton value="10">Grade 10</ToggleButton>
              <ToggleButton value="11">Grade 11</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Videos Grid */}
          <Grid container spacing={3}>
            {filteredVideos.map((video) => (
              <Grid item xs={12} sm={6} md={3} key={video.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  {/* YouTube style thumbnail mock */}
                  <Box sx={{ position: 'relative', pt: '56.25%', cursor: 'pointer' }} onClick={() => handleWatchVideo(video)}>
                    <CardMedia
                      component="img"
                      image={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                      alt={video.titleEn}
                      sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    />
                    <Box sx={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      bgcolor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: 0.8, '&:hover': { opacity: 1, bgcolor: 'rgba(0,0,0,0.15)' }
                    }}>
                      <PlayCircleOutline sx={{ fontSize: 50, color: '#ffffff' }} />
                    </Box>
                    <Chip
                      label={`Grade ${video.grade}`}
                      color="secondary"
                      size="small"
                      sx={{ position: 'absolute', top: 8, left: 8, fontWeight: 700 }}
                    />
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                      {language === 'en' ? video.titleEn : video.titleSi}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {language === 'en' ? video.descEn : video.descSi}
                    </Typography>
                  </CardContent>
                  <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">{video.duration}</Typography>
                    <Button size="small" variant="text" onClick={() => handleWatchVideo(video)}>
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
      <Container maxWidth="lg" id="grades" sx={{ py: 8 }}>
        <Typography variant="h4" textAlign="center" fontWeight={800} mb={1}>
          {t('grades_section_title')}
        </Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary" mb={6}>
          {t('grades_section_subtitle')}
        </Typography>

        <Grid container spacing={3}>
          {GRADE_INFO.map((g) => (
            <Grid item xs={12} sm={6} md={4} key={g.grade}>
              <Card sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderTop: `4px solid ${theme.palette.primary.main}`
              }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" fontWeight={800} gutterBottom>
                    {t('grade_card_title', { grade: g.grade })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    {t('grade_card_desc', { grade: g.grade })}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle fontSize="small" color="primary" />
                      <Typography variant="body2" fontWeight={600}>{t('class_time')}: {g.day}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle fontSize="small" color="primary" />
                      <Typography variant="body2" fontWeight={600}>English & Sinhala Medium</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle fontSize="small" color="primary" />
                      <Typography variant="body2" fontWeight={600}>Online Live + Recorded Access</Typography>
                    </Box>
                  </Box>
                </CardContent>
                <Box sx={{ p: 3, bgcolor: resolvedTheme === 'dark' ? '#27272a' : '#f8fafc', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="h6" fontWeight={700} color="secondary.main" textAlign="center">
                    {t('grade_fee', { fee: g.fee })}
                  </Typography>
                  <Button variant="contained" fullWidth onClick={() => navigate('/register')}>
                    {t('cta_join_now')}
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ── Teacher Section ─────────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: resolvedTheme === 'dark' ? '#18181b' : '#f8fafc', py: 8 }} id="teacher">
        <Container maxWidth="md">
          <Card sx={{ p: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 4 }}>
            {/* Standard image layout */}
            <Avatar
              sx={{ width: 140, height: 140, bgcolor: 'primary.main', fontSize: 48, fontWeight: 700 }}
            >
              KM
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={800} gutterBottom>{t('teacher_title')}</Typography>
              <Typography variant="subtitle1" color="primary.main" fontWeight={700} mb={2}>
                K-Maths Founder & Lead Mathematics Tutor
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {t('teacher_desc')}
              </Typography>
            </Box>
          </Card>
        </Container>
      </Box>

      {/* ── Contact Details ─────────────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={6} justifyContent="center">
          <Grid item xs={12} md={5}>
            <Typography variant="h4" fontWeight={800} mb={2}>
              {language === 'en' ? 'Get In Touch' : 'අප හා සම්බන්ධ වන්න'}
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>
              {language === 'en'
                ? 'Have questions about classes, payment, or schedules? Contact us directly.'
                : 'පන්ති, ගෙවීම් හෝ කාලසටහන් පිළිබඳව ප්‍රශ්න තිබේද? අප හා සෘජුවම සම්බන්ධ වන්න.'}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}><Phone /></Avatar>
                <Box>
                  <Typography variant="caption" display="block" color="text.secondary">Hotline</Typography>
                  <Typography variant="body1" fontWeight={700}>+94 77 123 4567</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}><Email /></Avatar>
                <Box>
                  <Typography variant="caption" display="block" color="text.secondary">Email Address</Typography>
                  <Typography variant="body1" fontWeight={700}>info@k-maths.lk</Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: resolvedTheme === 'dark' ? '#09090b' : '#0f172a', color: '#94a3b8', py: 5, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
          <Typography variant="h6" color="#ffffff" fontWeight={800} gutterBottom>
            {t('landing_title')}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
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
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: '#000000',
            color: '#ffffff'
          }
        }}
      >
        {activeVideo && (
          <>
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.paper', color: 'text.primary' }}>
              <Typography variant="h6" fontWeight={700}>
                {language === 'en' ? activeVideo.titleEn : activeVideo.titleSi}
              </Typography>
              <Button size="small" onClick={handleCloseVideo} variant="outlined">{t('close')}</Button>
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
