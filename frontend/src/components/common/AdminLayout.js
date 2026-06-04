import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Drawer, AppBar, Toolbar, Typography, IconButton,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Avatar, Divider, Chip, useMediaQuery, useTheme, Button, Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard, People, School, VideoLibrary,
  Quiz, Payment, EventNote, LibraryBooks, Logout, AdminPanelSettings,
  Language, LightMode, DarkMode, SettingsBrightness
} from '@mui/icons-material';
import { logoutUser } from '../../app/slices/authSlice';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';

const DRAWER_WIDTH = 248;

const navItems = [
  { label: 'Dashboard',    icon: <Dashboard />,        path: '/admin' },
  { label: 'Students',     icon: <People />,           path: '/admin/students' },
  { label: 'Courses',      icon: <School />,           path: '/admin/courses' },
  { label: 'Lessons',      icon: <VideoLibrary />,     path: '/admin/lessons' },
  { label: 'Quizzes',      icon: <Quiz />,             path: '/admin/quizzes' },
  { label: 'Payments',     icon: <Payment />,          path: '/admin/payments' },
  { label: 'Attendance',   icon: <EventNote />,        path: '/admin/attendance' },
  { label: 'Resources',    icon: <LibraryBooks />,     path: '/admin/resources' },
];

export default function AdminLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { language, setLanguage, themeMode, setThemeMode, t } = useThemeLanguage();

  const handleLogout = () => dispatch(logoutUser()).then(() => navigate('/login'));

  const getThemeIcon = () => {
    if (themeMode === 'light') return <LightMode fontSize="small" />;
    if (themeMode === 'dark') return <DarkMode fontSize="small" />;
    return <SettingsBrightness fontSize="small" />;
  };

  const handleThemeCycle = () => {
    if (themeMode === 'light') setThemeMode('dark');
    else if (themeMode === 'dark') setThemeMode('auto');
    else setThemeMode('light');
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: 2, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#fff' }}>K</Box>
        <Box>
          <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1 }}>{t('landing_title')}</Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>{t('admin')}</Typography>
        </Box>
      </Box>

      <Box sx={{ px: 2, pb: 2 }}>
        <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: 'secondary.main', fontSize: 13 }}>
            {user?.full_name?.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }} noWrap>{user?.full_name}</Typography>
            <Chip label={user?.role} size="small" sx={{ height: 16, fontSize: 10, bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', mt: 0.25 }} />
          </Box>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />

      <List sx={{ flex: 1, px: 1, py: 1.5 }}>
        {navItems.map(({ label, icon, path }) => {
          const active = path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);
          return (
            <ListItem key={path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => { navigate(path); isMobile && setMobileOpen(false); }}
                sx={{ borderRadius: 2, py: 1, backgroundColor: active ? 'rgba(255,255,255,0.18)' : 'transparent', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>
                <ListItemIcon sx={{ color: active ? '#fff' : 'rgba(255,255,255,0.6)', minWidth: 38 }}>{icon}</ListItemIcon>
                <ListItemText primary={label} primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 600 : 400, color: active ? '#fff' : 'rgba(255,255,255,0.8)' }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />
      <List sx={{ px: 1, py: 1 }}>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>
            <ListItemIcon sx={{ color: 'rgba(255,255,255,0.6)', minWidth: 38 }}><Logout /></ListItemIcon>
            <ListItemText primary={t('nav_logout')} primaryTypographyProps={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {isMobile ? (
          <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }}
            sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}>{drawer}</Drawer>
        ) : (
          <Drawer variant="permanent" sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none' } }}>{drawer}</Drawer>
        )}
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppBar position="sticky" elevation={0} sx={{ zIndex: (t) => t.zIndex.drawer - 1 }}>
          <Toolbar>
            {isMobile && <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}><MenuIcon /></IconButton>}
            <AdminPanelSettings sx={{ mr: 1, opacity: 0.8 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>
              {navItems.find((n) => (n.path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(n.path)))?.label || 'Admin'}
            </Typography>

            {/* Language switch */}
            <Button
              color="inherit"
              size="small"
              onClick={() => setLanguage(language === 'en' ? 'si' : 'en')}
              startIcon={<Language />}
              sx={{ mr: 2, textTransform: 'none', fontWeight: 700 }}
            >
              {language === 'en' ? 'සිංහල' : 'English'}
            </Button>

            {/* Theme switch */}
            <Tooltip title={`${t('theme')}: ${t('theme_' + themeMode)}`}>
              <IconButton color="inherit" onClick={handleThemeCycle} sx={{ mr: 2 }}>
                {getThemeIcon()}
              </IconButton>
            </Tooltip>

            <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.2)', fontSize: 13 }}>
              {user?.full_name?.charAt(0)}
            </Avatar>
          </Toolbar>
        </AppBar>
        <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
