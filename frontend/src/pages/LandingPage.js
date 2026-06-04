import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box, Typography, Button, Container, Grid, Card, CardContent,
  CardMedia, IconButton, Dialog, DialogContent, DialogTitle, useTheme, Chip, Avatar,
  ToggleButton, ToggleButtonGroup, Tooltip, Stack, Paper, LinearProgress,
  Accordion, AccordionSummary, AccordionDetails, Alert, TextField
} from '@mui/material';
import {
  PlayCircleOutline, School, VideoLibrary, LibraryBooks, HelpOutline, CheckCircle,
  Phone, Email, Star, ShowChart, CalendarMonth, AccessTime, FileDownload,
  ExpandMore, Send
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

const TESTIMONIALS = [
  {
    nameEn: 'Sithum Nimsara',
    nameSi: 'සිතුම් නිම්සර',
    gradeEn: 'Grade 11 - A Grade',
    gradeSi: '11 ශ්‍රේණිය - A සාමාර්ථයක්',
    commentEn: 'K-Maths completely changed my perspective on math. The simplified methods and live class recordings helped me score an A in my O/Ls.',
    commentSi: 'කේ-මැත්ස් නිසා ගණිතය මට හරිම ලේසි විෂයක් වුණා. සරල ක්‍රමවේද සහ පන්ති පටිගත කිරීම් නිසා මට සාමාන්‍ය පෙළට A සාමාර්ථයක් ගන්න පුළුවන් වුණා.',
    avatar: 'SN',
    color: '#1565C0'
  },
  {
    nameEn: 'Arundathi Fernando',
    nameSi: 'අරුන්දතී ප්‍රනාන්දු',
    gradeEn: 'Grade 11 - A Grade',
    gradeSi: '11 ශ්‍රේණිය - A සාමාර්ථයක්',
    commentEn: 'The weekly quizzes and topic-by-topic analytics allowed me to identify my weak areas and improve rapidly. Thank you K-Maths!',
    commentSi: 'සතිපතා ප්‍රශ්න පත්‍ර සහ ප්‍රස්ථාර විශ්ලේෂණ මඟින් මගේ දුර්වලතා හඳුනාගෙන ඒවා ඉක්මනින් නිවැරදි කරගන්න උදව් වුණා. ස්තූතියි කේ-මැත්ස්!',
    avatar: 'AF',
    color: '#F57C00'
  },
  {
    nameEn: 'Dineth Methsara',
    nameSi: 'දිනෙත් මෙත්සර',
    gradeEn: 'Grade 10 Student',
    gradeSi: '10 ශ්‍රේණියේ ශිෂ්‍යයෙක්',
    commentEn: 'I missed many school lessons, but the video vault on K-Maths allowed me to catch up easily. The Sinhala explanations are crystal clear.',
    commentSi: 'මට පාසලේ මඟ හැරුණු පාඩම් බොහොමයක් කේ-මැත්ස් වීඩියෝ මඟින් පහසුවෙන් ආවරණය කර ගැනීමට හැකි වුණා. පැහැදිලි කිරීම් ඉතාමත් පැහැදිලියි.',
    avatar: 'DM',
    color: '#2E7D32'
  }
];

const FAQS = [
  {
    qEn: 'Are the online classes conducted in Sinhala or English medium?',
    qSi: 'සජීවී පන්ති පැවැත්වෙන්නේ සිංහල මාධ්‍යයෙන්ද නැතහොත් ඉංග්‍රීසි මාධ්‍යයෙන්ද?',
    aEn: 'Classes are conducted in bilingual methods. We cover explanation terms in Sinhala and use English notations, supporting students from both mediums.',
    aSi: 'පන්ති ද්විභාෂා ක්‍රමවේදයෙන්ම පැවැත්වේ. සිංහල මාධ්‍යයේ සහ ඉංග්‍රීසි මාධ්‍යයේ සිසුන් දෙපිරිසටම ගැළපෙන පරිදි සිංහල පැහැදිලි කිරීම් මෙන්ම ඉංග්‍රීසි පාරිභාෂික වචනද භාවිතා කරනු ලැබේ.'
  },
  {
    qEn: 'What if I miss a live Zoom class?',
    qSi: 'සජීවී Zoom පන්තියක් මඟ හැරුණහොත් කුමක් කළ යුතුද?',
    aEn: 'All live lectures are recorded and uploaded to the student Video Vault within 24 hours. Enrolled students can watch them anytime, anywhere.',
    aSi: 'සියලුම සජීවී දේශන පටිගත කර පැය 24ක් ඇතුළත ශිෂ්‍ය වීඩියෝ එකතුවට (Video Vault) එක් කරනු ලැබේ. ලියාපදිංචි සිසුන්ට ඕනෑම වේලාවක ඒවා නැරඹිය හැකිය.'
  },
  {
    qEn: 'How can I download class materials and past papers?',
    qSi: 'පන්ති නිබන්ධන සහ පසුගිය ප්‍රශ්න පත්‍ර බාගත කර ගන්නේ කෙසේද?',
    aEn: 'Once logged into your student portal, visit the "Resources" section. You can view, search, and download PDFs, model answers, and worksheets instantly.',
    aSi: 'ඔබේ ශිෂ්‍ය ගිණුමට ඇතුළු වී "Resources" පිටුවට පිවිසෙන්න. එතැනින් සියලුම නිබන්ධන, ආදර්ශ පිළිතුරු සහ වැඩ පත්‍රිකා PDF ආකාරයෙන් නොමිලේ බාගත හැක.'
  },
  {
    qEn: 'How do I pay the monthly course fees?',
    qSi: 'මාසික පන්ති ගාස්තු ගෙවන්නේ කෙසේද?',
    aEn: 'You can securely pay online using credit/debit cards or upload bank slip receipts directly via the "Payments" page in your student portal. Accounts are activated immediately upon verification.',
    aSi: 'ඔබේ ශිෂ්‍ය ගිණුමේ ඇති "Payments" පිටුව හරහා ක්‍රෙඩිට්/ඩෙබිට් කාඩ්පත් මඟින් සුරක්ෂිතව මාර්ගගතව ගෙවිය හැකිය. නැතහොත් බැංකු කුවිතාන්සිය (Bank Slip) අප්ලෝඩ් කළ හැකිය.'
  }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { language, resolvedTheme, t } = useThemeLanguage();

  // States
  const [activeVideo, setActiveVideo] = useState(null);
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('all');
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleWatchVideo = (video) => {
    setActiveVideo(video);
  };

  const handleCloseVideo = () => {
    setActiveVideo(null);
  };

  const handleContactChange = (e) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setContactForm({ name: '', email: '', message: '' });
    setTimeout(() => {
      setFormSubmitted(false);
    }, 4500);
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

  // --- Spring & Glowing Animations ---
  const fadeInUpStyle = {
    '@keyframes fadeInUp': {
      from: { opacity: 0, transform: 'translateY(35px)' },
      to: { opacity: 1, transform: 'translateY(0)' }
    },
    animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards'
  };

  const floatStyle = (delay = '0s', duration = '6s') => ({
    '@keyframes float': {
      '0%, 100%': { transform: 'translateY(0px)' },
      '50%': { transform: 'translateY(-15px)' }
    },
    animation: `float ${duration} ease-in-out infinite`,
    animationDelay: delay
  });

  const floatHorizontalStyle = (delay = '0s') => ({
    '@keyframes floatH': {
      '0%, 100%': { transform: 'translateX(0px) rotate(0deg)' },
      '50%': { transform: 'translateX(12px) rotate(4deg)' }
    },
    animation: `floatH 7s ease-in-out infinite`,
    animationDelay: delay
  });

  const floatSlowBlob = (delay = '0s') => ({
    '@keyframes floatBlob': {
      '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
      '33%': { transform: 'translate(30px, -40px) scale(1.1)' },
      '66%': { transform: 'translate(-20px, 20px) scale(0.95)' }
    },
    animation: 'floatBlob 12s ease-in-out infinite',
    animationDelay: delay
  });

  const jellyHoverCard = {
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    '&:hover': {
      transform: 'translateY(-10px)',
      boxShadow: resolvedTheme === 'dark' 
        ? '0 20px 40px rgba(0,0,0,0.6), 0 0 25px rgba(21,101,192,0.3)' 
        : '0 20px 40px rgba(21,101,192,0.12)',
      borderColor: 'primary.light',
      '& .MuiAvatar-root': {
        transform: 'scale(1.1) rotate(5deg)',
        backgroundColor: 'secondary.main',
      }
    }
  };

  const jellyHoverButton = {
    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: '0 8px 20px rgba(21,101,192,0.35)'
    },
    '&:active': {
      transform: 'scale(0.96)'
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', overflowX: 'hidden', position: 'relative' }}>
      
      {/* ── Ambient Glowing Background Blobs ── */}
      <Box sx={{
        position: 'absolute', top: '5%', left: '-5%', width: { xs: 200, md: 450 }, height: { xs: 200, md: 450 },
        borderRadius: '50%',
        background: resolvedTheme === 'dark' ? 'radial-gradient(circle, rgba(21,101,192,0.15) 0%, rgba(0,0,0,0) 70%)' : 'radial-gradient(circle, rgba(186,230,253,0.4) 0%, rgba(255,255,255,0) 70%)',
        filter: 'blur(80px)', zIndex: 1, pointerEvents: 'none', ...floatSlowBlob('0s')
      }} />
      <Box sx={{
        position: 'absolute', top: '35%', right: '-5%', width: { xs: 250, md: 500 }, height: { xs: 250, md: 500 },
        borderRadius: '50%',
        background: resolvedTheme === 'dark' ? 'radial-gradient(circle, rgba(245,124,0,0.12) 0%, rgba(0,0,0,0) 70%)' : 'radial-gradient(circle, rgba(254,215,170,0.35) 0%, rgba(255,255,255,0) 70%)',
        filter: 'blur(90px)', zIndex: 1, pointerEvents: 'none', ...floatSlowBlob('2s')
      }} />
      <Box sx={{
        position: 'absolute', bottom: '15%', left: '5%', width: { xs: 200, md: 400 }, height: { xs: 200, md: 400 },
        borderRadius: '50%',
        background: resolvedTheme === 'dark' ? 'radial-gradient(circle, rgba(46,125,50,0.1) 0%, rgba(0,0,0,0) 70%)' : 'radial-gradient(circle, rgba(220,252,231,0.3) 0%, rgba(255,255,255,0) 70%)',
        filter: 'blur(80px)', zIndex: 1, pointerEvents: 'none', ...floatSlowBlob('4s')
      }} />

      {/* ── Double-Column Hero Section ──────────────────────────────────────── */}
      <Box sx={{
        position: 'relative',
        py: { xs: 8, md: 14 },
        borderBottom: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
        zIndex: 2
      }}>
        {/* Floating math equations */}
        <Box sx={{
          position: 'absolute', top: '10%', left: '4%', opacity: 0.15,
          bgcolor: 'primary.main', color: '#fff', px: 1.8, py: 0.6, borderRadius: 2, fontSize: 13, fontWeight: 800,
          boxShadow: '0 4px 10px rgba(0,0,0,0.05)', ...floatStyle('0s', '5s')
        }}>
          √x + y² = z
        </Box>
        <Box sx={{
          position: 'absolute', bottom: '15%', left: '45%', opacity: 0.15,
          bgcolor: 'secondary.main', color: '#fff', px: 1.8, py: 0.6, borderRadius: 2, fontSize: 14, fontWeight: 900,
          boxShadow: '0 4px 10px rgba(0,0,0,0.05)', ...floatStyle('1.5s', '6s')
        }}>
          π = 3.14159
        </Box>

        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            {/* Left Typography Column */}
            <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'center', md: 'left' }, ...fadeInUpStyle }}>
              <Chip
                label={t('landing_subtitle')}
                color="primary"
                variant="outlined"
                sx={{ 
                  mb: 3, fontWeight: 700, borderRadius: '20px', px: 2, py: 1.8, fontSize: '0.85rem',
                  borderColor: 'primary.main', bgcolor: resolvedTheme === 'dark' ? 'rgba(21,101,192,0.15)' : 'rgba(21,101,192,0.06)'
                }}
              />
              <Typography variant="h1" sx={{
                fontWeight: 900, mb: 2.5,
                background: 'linear-gradient(45deg, #1565C0 25%, #F57C00 85%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                fontSize: { xs: '2.8rem', sm: '3.6rem', md: '4.4rem' },
                lineHeight: 1.1, letterSpacing: -1.5
              }}>
                {language === 'en' ? 'Master O/L Mathematics' : 'සාමාන්‍ය පෙළ ගණිතය ජයගන්න'}
              </Typography>
              <Typography variant="h5" color="text.secondary" sx={{ mb: 5, fontWeight: 400, fontSize: { xs: '1.1rem', md: '1.25rem' }, lineHeight: 1.6 }}>
                {t('landing_tagline')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2.5, justifyContent: { xs: 'center', md: 'flex-start' }, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" size="large" startIcon={<School />} 
                  sx={{ borderRadius: 3, px: 4, py: 1.8, fontSize: 16, fontWeight: 700, ...jellyHoverButton }}
                  onClick={() => navigate('/register')}
                >
                  {t('cta_join_now')}
                </Button>
                <Button 
                  variant="outlined" size="large" startIcon={<PlayCircleOutline />} 
                  sx={{ borderRadius: 3, px: 4, py: 1.8, fontSize: 16, fontWeight: 700, ...jellyHoverButton }}
                  onClick={() => scrollToSection('videos')}
                >
                  {t('cta_free_videos')}
                </Button>
              </Box>
            </Grid>

            {/* Right Column: Premium Interactive Glassmorphic Dashboard Preview */}
            <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', ...floatStyle('0.5s', '8s') }}>
              <Paper 
                elevation={0}
                sx={{
                  width: '100%', maxWidth: 460, borderRadius: 5, p: 3,
                  bgcolor: resolvedTheme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.45)',
                  backdropFilter: 'blur(24px)',
                  border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(21,101,192,0.12)'}`,
                  boxShadow: resolvedTheme === 'dark' ? '0 30px 60px rgba(0,0,0,0.5)' : '0 30px 60px rgba(21,101,192,0.12)',
                  position: 'relative'
                }}
              >
                {/* Floating XP Badge */}
                <Box sx={{
                  position: 'absolute', top: '-15px', right: '-15px',
                  bgcolor: 'warning.main', color: '#fff', px: 2, py: 0.8, borderRadius: 3,
                  boxShadow: '0 8px 16px rgba(245,124,0,0.3)', fontWeight: 800, fontSize: 13,
                  ...floatHorizontalStyle('0.8s')
                }}>
                  🔥 +150 XP Streak
                </Box>

                <Stack spacing={2.5}>
                  {/* Header bar mock */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: 14, fontWeight: 700 }}>K</Avatar>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Student Portal</Typography>
                        <Typography variant="body2" fontWeight={700}>Keshara Rathnayaka</Typography>
                      </Box>
                    </Box>
                    <Chip label="Grade 11" color="primary" size="small" sx={{ fontWeight: 700, borderRadius: 2 }} />
                  </Box>

                  {/* Circular progress display mock */}
                  <Box sx={{ p: 2, bgcolor: resolvedTheme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.6)', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ position: 'relative', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="64" height="64">
                        <circle cx="32" cy="32" r="26" fill="transparent" stroke={resolvedTheme === 'dark' ? '#334155' : '#e2e8f0'} strokeWidth="5" />
                        <circle cx="32" cy="32" r="26" fill="transparent" stroke="#1565C0" strokeWidth="5" strokeDasharray="163" strokeDashoffset="35" strokeLinecap="round" transform="rotate(-90 32 32)" />
                      </svg>
                      <Typography variant="caption" sx={{ position: 'absolute', fontWeight: 800, color: 'primary.main' }}>82%</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={750}>Syllabus Completed</Typography>
                      <Typography variant="caption" color="text.secondary">8/10 Chapters Mastered successfully</Typography>
                    </Box>
                  </Box>

                  {/* Statistics Chart Preview Mock */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                      <Typography variant="caption" fontWeight={700}>Trigonometry Mastery</Typography>
                      <Typography variant="caption" color="success.main" fontWeight={800}>92% Accuracy</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={92} color="success" sx={{ height: 6, borderRadius: 3 }} />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                      <Typography variant="caption" fontWeight={700}>Algebraic Fractions</Typography>
                      <Typography variant="caption" color="warning.main" fontWeight={800}>74% Accuracy</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={74} color="warning" sx={{ height: 6, borderRadius: 3 }} />
                  </Box>

                  {/* Class links mock */}
                  <Stack direction="row" spacing={1.5}>
                    <Button variant="contained" size="small" startIcon={<ShowChart />} sx={{ flex: 1, borderRadius: 2.5, textTransform: 'none', fontWeight: 700 }}>
                      Analytics
                    </Button>
                    <Button variant="outlined" size="small" startIcon={<AccessTime />} sx={{ flex: 1, borderRadius: 2.5, textTransform: 'none', fontWeight: 700 }}>
                      Schedule
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
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
                <Avatar sx={{ bgcolor: 'primary.light', width: 60, height: 60, mx: 'auto', mb: 3, transition: 'all 0.3s ease', boxShadow: '0 4px 10px rgba(30,136,229,0.3)' }}>
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
                <Avatar sx={{ bgcolor: 'secondary.light', width: 60, height: 60, mx: 'auto', mb: 3, transition: 'all 0.3s ease', boxShadow: '0 4px 10px rgba(255,167,38,0.3)' }}>
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
                <Avatar sx={{ bgcolor: 'success.light', width: 60, height: 60, mx: 'auto', mb: 3, transition: 'all 0.3s ease', boxShadow: '0 4px 10px rgba(46,125,50,0.3)' }}>
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
                <Avatar sx={{ bgcolor: 'warning.light', width: 60, height: 60, mx: 'auto', mb: 3, transition: 'all 0.3s ease', boxShadow: '0 4px 10px rgba(249,168,37,0.3)' }}>
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

      {/* ── Testimonials Section ─────────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ py: 12, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h4" textAlign="center" fontWeight={900} mb={1}>
          {language === 'en' ? 'Success Stories' : 'සාර්ථකත්වයේ කතන්දර'}
        </Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary" mb={8}>
          {language === 'en' ? 'Hear from students who conquered O/L mathematics with K-Maths' : 'කේ-මැත්ස් සමඟින් සාමාන්‍ය පෙළ ගණිතය ජයගත් අපේ දරුවන්ගේ අදහස්'}
        </Typography>
        <Grid container spacing={4}>
          {TESTIMONIALS.map((t, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Card sx={{ height: '100%', p: 3.5, display: 'flex', flexDirection: 'column', ...jellyHoverCard }}>
                <CardContent sx={{ flexGrow: 1, p: 0 }}>
                  <Stack direction="row" spacing={2} alignItems="center" mb={2.5}>
                    <Avatar sx={{ bgcolor: `${t.color}15`, color: t.color, fontWeight: 800, width: 48, height: 48 }}>
                      {t.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={750}>
                        {language === 'en' ? t.nameEn : t.nameSi}
                      </Typography>
                      <Typography variant="caption" color="primary.main" fontWeight={700}>
                        {language === 'en' ? t.gradeEn : t.gradeSi}
                      </Typography>
                    </Box>
                  </Stack>
                  <Box sx={{ display: 'flex', color: 'warning.main', mb: 2 }}>
                    {[...Array(5)].map((_, idx) => <Star key={idx} fontSize="small" />)}
                  </Box>
                  <Typography variant="body2" color="text.secondary" lineHeight={1.7} sx={{ fontStyle: 'italic', opacity: 0.9 }}>
                    "{language === 'en' ? t.commentEn : t.commentSi}"
                  </Typography>
                </CardContent>
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
                background: 'linear-gradient(135deg, #0d47a1 0%, #1e88e5 100%)',
                transition: 'all 0.3s ease'
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

      {/* ── FAQ Section ─────────────────────────────────────────────────────── */}
      <Box sx={{ py: 12, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Container maxWidth="md">
          <Typography variant="h4" textAlign="center" fontWeight={900} mb={1}>
            {language === 'en' ? 'Frequently Asked Questions' : 'නිතර අසන ප්‍රශ්න'}
          </Typography>
          <Typography variant="body1" textAlign="center" color="text.secondary" mb={8}>
            {language === 'en' ? 'Got questions? We have answers.' : 'පන්ති සම්බන්ධයෙන් ඔබට ඇති ගැටලුවලට පිළිතුරු'}
          </Typography>
          <Stack spacing={2}>
            {FAQS.map((faq, i) => (
              <Accordion 
                key={i} 
                elevation={0}
                sx={{
                  borderRadius: '12px !important',
                  border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                  bgcolor: resolvedTheme === 'dark' ? 'rgba(30, 41, 59, 0.2)' : 'rgba(255, 255, 255, 0.4)',
                  backdropFilter: 'blur(10px)',
                  '&:before': { display: 'none' },
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.light',
                    boxShadow: resolvedTheme === 'dark' ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 12px rgba(21,101,192,0.05)'
                  }
                }}
              >
                <AccordionSummary 
                  expandIcon={<ExpandMore sx={{ color: 'primary.main' }} />}
                  sx={{ px: 3, py: 1.5 }}
                >
                  <Typography variant="subtitle1" fontWeight={750}>
                    {language === 'en' ? faq.qEn : faq.qSi}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                  <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
                    {language === 'en' ? faq.aEn : faq.aSi}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* ── Contact Details & Form Section ──────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Grid container spacing={6} justifyContent="center" alignItems="center">
          {/* Left Column: Contact info */}
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

          {/* Right Column: Premium Contact Form */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0}
              sx={{
                p: { xs: 3.5, sm: 4.5 },
                borderRadius: 5,
                backdropFilter: 'blur(20px)',
                bgcolor: resolvedTheme === 'dark' ? 'rgba(30, 41, 59, 0.45)' : 'rgba(255, 255, 255, 0.55)',
                border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(21,101,192,0.1)'}`,
                boxShadow: resolvedTheme === 'dark' 
                  ? '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)' 
                  : '0 20px 40px rgba(21,101,192,0.06)'
              }}
            >
              {formSubmitted ? (
                <Alert severity="success" sx={{ borderRadius: 2.5, py: 1.5 }}>
                  {language === 'en' 
                    ? 'Thank you! Your message has been sent successfully.' 
                    : 'ස්තූතියි! ඔබේ පණිවිඩය සාර්ථකව යවන ලදී.'}
                </Alert>
              ) : (
                <Box component="form" onSubmit={handleContactSubmit}>
                  <Typography variant="h6" fontWeight={800} mb={3.5} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Send fontSize="small" color="primary" />
                    {language === 'en' ? 'Send a Message' : 'පණිවිඩයක් එවන්න'}
                  </Typography>
                  <Stack spacing={2.5}>
                    <TextField 
                      fullWidth 
                      label={language === 'en' ? 'Your Name' : 'ඔබේ නම'} 
                      name="name"
                      value={contactForm.name}
                      onChange={handleContactChange}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2.5,
                          bgcolor: resolvedTheme === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.3)',
                        }
                      }}
                    />
                    <TextField 
                      fullWidth 
                      type="email" 
                      label={language === 'en' ? 'Email Address' : 'විද්‍යුත් ලිපිනය'} 
                      name="email"
                      value={contactForm.email}
                      onChange={handleContactChange}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2.5,
                          bgcolor: resolvedTheme === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.3)',
                        }
                      }}
                    />
                    <TextField 
                      fullWidth 
                      multiline 
                      rows={4} 
                      label={language === 'en' ? 'Your Message' : 'ඔබේ පණිවිඩය'} 
                      name="message"
                      value={contactForm.message}
                      onChange={handleContactChange}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2.5,
                          bgcolor: resolvedTheme === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.3)',
                        }
                      }}
                    />
                    <Button 
                      type="submit" 
                      variant="contained" 
                      size="large"
                      sx={{ borderRadius: 2.5, fontWeight: 700, py: 1.5, ...jellyHoverButton }}
                    >
                      {language === 'en' ? 'Send Message' : 'පණිවිඩය එවන්න'}
                    </Button>
                  </Stack>
                </Box>
              )}
            </Paper>
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
