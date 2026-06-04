import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box, AppBar, Toolbar, Typography, Button, Container, Tooltip,
  ToggleButton, ToggleButtonGroup, useTheme, IconButton, Drawer,
  List, ListItem, ListItemButton, ListItemText, Divider
} from '@mui/material';
import {
  Language, LightMode, DarkMode, SettingsBrightness, School, Home,
  Menu as MenuIcon, Close as CloseIcon
} from '@mui/icons-material';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';

export default function PublicLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { language, setLanguage, themeMode, setThemeMode, resolvedTheme, t } = useThemeLanguage();
  const { isAuthenticated } = useSelector((s) => s.auth);

  const [mobileOpen, setMobileOpen] = useState(false);

  const isHome = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const navItems = [
    { label: 'features_title', id: 'features' },
    { label: 'free_videos_title', id: 'videos' },
    { label: 'grades_section_title', id: 'grades' },
    { label: 'teacher_title', id: 'teacher' }
  ];

  const scrollToSection = (id) => {
    if (!isHome) {
      navigate('/#' + id);
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const jellyHoverButton = {
    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: '0 4px 12px rgba(21,101,192,0.25)'
    },
    '&:active': {
      transform: 'scale(0.96)'
    }
  };

  const drawerContent = (
    <Box sx={{ width: 260, pt: 3, px: 2.5, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{
            width: 32, height: 32, borderRadius: '8px',
            background: 'linear-gradient(135deg, #1565C0 0%, #1E88E5 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 800, color: '#fff'
          }}>K</Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '1.1rem' }}>
            K-Maths
          </Typography>
        </Box>
        <IconButton onClick={() => setMobileOpen(false)} sx={{ border: '1px solid rgba(0,0,0,0.06)' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Divider sx={{ mb: 2 }} />
      {isHome ? (
        <List sx={{ flexGrow: 1 }}>
          {navItems.map((item) => (
            <ListItem disablePadding key={item.id} sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => {
                  setMobileOpen(false);
                  scrollToSection(item.id);
                }}
                sx={{ 
                  borderRadius: 2,
                  py: 1.2,
                  '&:hover': { bgcolor: 'rgba(21,101,192,0.08)' }
                }}
              >
                <ListItemText 
                  primary={t(item.label)} 
                  primaryTypographyProps={{ fontWeight: 700, color: 'text.primary', fontSize: '0.95rem' }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      ) : (
        <Box sx={{ flexGrow: 1, py: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {language === 'en' ? 'Navigate back to the main portal.' : 'ප්‍රධාන පිටුව වෙත පිවිසෙන්න.'}
          </Typography>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<Home />}
            onClick={() => { setMobileOpen(false); navigate('/'); }}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            {language === 'en' ? 'Back Home' : 'ප්‍රධාන පිටුව'}
          </Button>
        </Box>
      )}
      
      <Box sx={{ pb: 4 }}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1, fontWeight: 600 }}>
          {language === 'en' ? 'Quick Actions' : 'ක්‍රියාකාරකම්'}
        </Typography>
        {isAuthenticated ? (
          <Button 
            variant="contained" 
            fullWidth 
            sx={{ borderRadius: 2, fontWeight: 700, py: 1.2 }} 
            onClick={() => { setMobileOpen(false); navigate('/dashboard'); }}
          >
            {t('cta_dashboard')}
          </Button>
        ) : (
          <Button 
            variant="contained" 
            fullWidth 
            sx={{ borderRadius: 2, fontWeight: 700, py: 1.2 }} 
            onClick={() => { setMobileOpen(false); navigate('/login'); }}
          >
            {t('login')}
          </Button>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* ── Premium Glassmorphic Header ── */}
      <AppBar 
        position="fixed" 
        elevation={0} 
        sx={{ 
          backdropFilter: 'blur(16px)',
          background: resolvedTheme === 'dark' ? 'rgba(18, 18, 18, 0.8)' : 'rgba(255, 255, 255, 0.85)',
          backgroundImage: 'none',
          borderBottom: `1px solid ${resolvedTheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
          zIndex: theme.zIndex.drawer + 1,
          color: resolvedTheme === 'dark' ? '#f8fafc' : '#0f172a',
          transition: 'all 0.3s ease'
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', height: { xs: 64, md: 72 } }}>
            
            {/* Brand Logo & Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => navigate('/')}>
              <Box sx={{
                width: 38, height: 38, borderRadius: '10px',
                background: 'linear-gradient(135deg, #1565C0 0%, #1E88E5 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 800, color: '#fff',
                boxShadow: '0 2px 8px rgba(21,101,192,0.3)',
                ...jellyHoverButton
              }}>K</Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 0.5, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                {t('landing_title')}
              </Typography>
            </Box>

            {/* Desktop Navigation Links (Only shown on home page) */}
            {isHome && (
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                {navItems.map((item) => (
                  <Button 
                    key={item.id}
                    color="inherit" 
                    sx={{ 
                      borderRadius: 2, 
                      px: 2, 
                      fontWeight: 600,
                      '&:hover': { bgcolor: 'rgba(21,101,192,0.08)', color: 'primary.main' },
                      transition: 'all 0.2s ease'
                    }} 
                    onClick={() => scrollToSection(item.id)}
                  >
                    {t(item.label)}
                  </Button>
                ))}
              </Box>
            )}

            {/* Controls Menu */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {/* Language Switcher */}
              <ToggleButtonGroup
                size="small"
                value={language}
                exclusive
                onChange={(_, val) => val && setLanguage(val)}
                aria-label="Language Selector"
                sx={{ 
                  bgcolor: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                  borderRadius: 2,
                  '& .MuiToggleButton-root': {
                    border: 'none',
                    fontWeight: 700,
                    px: 1.2,
                    py: 0.4,
                    color: 'text.secondary',
                    '&.Mui-selected': {
                      bgcolor: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(21,101,192,0.1)',
                      color: 'primary.main'
                    }
                  }
                }}
              >
                <ToggleButton value="en">EN</ToggleButton>
                <ToggleButton value="si">සිං</ToggleButton>
              </ToggleButtonGroup>

              {/* Theme Selector (Cycler inside compact UI) */}
              <ToggleButtonGroup
                size="small"
                value={themeMode}
                exclusive
                onChange={(_, val) => val && setThemeMode(val)}
                aria-label="Theme Selector"
                sx={{ 
                  bgcolor: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', 
                  borderRadius: 2,
                  display: { xs: 'none', sm: 'flex' },
                  '& .MuiToggleButton-root': {
                    border: 'none',
                    p: 0.5,
                    color: 'text.secondary',
                    '&.Mui-selected': {
                      bgcolor: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(21,101,192,0.1)',
                      color: 'primary.main'
                    }
                  }
                }}
              >
                <Tooltip title={t('theme_light')}>
                  <ToggleButton value="light"><LightMode fontSize="small" /></ToggleButton>
                </Tooltip>
                <Tooltip title={t('theme_dark')}>
                  <ToggleButton value="dark"><DarkMode fontSize="small" /></ToggleButton>
                </Tooltip>
                <Tooltip title={t('theme_auto')}>
                  <ToggleButton value="auto"><SettingsBrightness fontSize="small" /></ToggleButton>
                </Tooltip>
              </ToggleButtonGroup>

              {/* Dynamic CTA Auth */}
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                {isAuthenticated ? (
                  <Button variant="contained" size="small" sx={{ borderRadius: 2, fontWeight: 700, px: 2.5, py: 1, ...jellyHoverButton }} onClick={() => navigate('/dashboard')}>
                    {t('cta_dashboard')}
                  </Button>
                ) : isHome ? (
                  <Button variant="contained" size="small" sx={{ borderRadius: 2, fontWeight: 700, px: 2.5, py: 1, ...jellyHoverButton }} onClick={() => navigate('/login')}>
                    {t('login')}
                  </Button>
                ) : (
                  <Button variant="outlined" size="small" startIcon={<Home />} sx={{ borderRadius: 2, fontWeight: 700, px: 2.5, py: 1, ...jellyHoverButton }} onClick={() => navigate('/')}>
                    {language === 'en' ? 'Home' : 'ප්‍රධාන පිටුව'}
                  </Button>
                )}
              </Box>

              {/* Mobile Hamburger Drawer Menu Toggle */}
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={() => setMobileOpen(true)}
                sx={{ 
                  display: { xs: 'flex', md: isHome ? 'none' : 'flex' },
                  border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)'}`,
                  borderRadius: 2,
                  p: 0.8
                }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Spacing for Fixed Header */}
      {/* If it's an auth page, we want a clean transparent overlay on a full-height centered page layout.
          Otherwise, we push down by header height (64px/72px) to prevent overlapping */}
      <Box sx={{ 
        pt: isAuthPage ? 0 : { xs: '64px', md: '72px' }, 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        position: 'relative',
        zIndex: 0
      }}>
        <Outlet />
      </Box>

      {/* Mobile Drawer Navigation */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }} // Better mobile performance
        sx={{
          display: { xs: 'block', md: isHome ? 'none' : 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 260,
            borderLeft: `1px solid ${resolvedTheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
