import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  Box, Grid, Typography, Card, CardContent, CardActionArea,
  LinearProgress, Chip, Button, Skeleton, Avatar, Stack,
} from '@mui/material';
import {
  PlayCircle, Quiz, Assignment, TrendingUp,
  School, EmojiEvents, CheckCircle,
} from '@mui/icons-material';
import StatCard from '../../components/common/StatCard';
import { enrollmentApi, quizApi, attendanceApi } from '../../api';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';

const GreetingBanner = ({ name }) => {
  const { language } = useThemeLanguage();
  const hour = new Date().getHours();
  
  let greeting = '';
  if (language === 'en') {
    greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  } else {
    greeting = hour < 12 ? 'සුභ උදෑසනක්' : hour < 17 ? 'සුභ දහවලක්' : 'සුභ සැන්දෑවක්';
  }

  return (
    <Card sx={{ background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #1E88E5 100%)', color: '#fff', mb: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{greeting}, {name?.split(' ')[0]}! 👋</Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
              {language === 'en' 
                ? 'Keep up the great work — every problem solved is progress made.' 
                : 'උත්සාහයෙන් වැඩ කරන්න — විසඳන සෑම ගැටලුවක්ම ඔබේ ප්‍රගතියයි.'}
            </Typography>
          </Box>
          <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(255,255,255,0.2)', fontSize: 28 }}>
            {name?.charAt(0)}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { language, t } = useThemeLanguage();

  const { data: enrollData, isLoading: loadEnroll } = useQuery('my-enrollments', () => enrollmentApi.mine().then((r) => r.data));
  const { data: progressData, isLoading: loadProgress } = useQuery('my-progress', () => quizApi.progress().then((r) => r.data));
  const { data: attendData, isLoading: loadAttend } = useQuery('my-attendance', () => attendanceApi.student('me').then((r) => r.data));

  const enrollments = enrollData?.enrollments || [];
  const progress = progressData || {};
  const attendance = attendData?.attendance || [];

  const recentLessons = attendance.slice(0, 3);

  return (
    <Box>
      <GreetingBanner name={user?.full_name} />

      {/* Stats */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={language === 'en' ? 'Enrolled Courses' : 'ලියාපදිංචි පන්ති'}
            value={enrollments.length} icon={<School />} color="primary.main" loading={loadEnroll} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={language === 'en' ? 'Quizzes Taken' : 'මුහුණ දුන් ප්‍රශ්න පත්‍ර'}
            value={progress.overall?.quizzes_taken ?? 0} icon={<Quiz />} color="secondary.main" loading={loadProgress} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={language === 'en' ? 'Avg Quiz Score' : 'સાමාන්‍ය ලකුණු'}
            value={`${progress.overall?.avg_score ?? 0}%`} icon={<TrendingUp />} color="success.main" loading={loadProgress} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={language === 'en' ? 'Classes Attended' : 'පැමිණි වාර ගණන'}
            value={attendance.length} icon={<CheckCircle />} color="info.main" loading={loadAttend} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* My Courses */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>{t('nav_my_classes')}</Typography>
                <Button size="small" onClick={() => navigate('/my-classes')}>
                  {language === 'en' ? 'View All' : 'සියල්ල බලන්න'}
                </Button>
              </Box>
              {loadEnroll ? (
                [1, 2].map((k) => <Skeleton key={k} variant="rounded" height={72} sx={{ mb: 1 }} />)
              ) : enrollments.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <School sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography color="text.secondary">
                    {language === 'en' ? 'No courses yet.' : 'තවමත් කිසිදු පන්තියකට ලියාපදිංචි වී නැත.'}
                  </Typography>
                  <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/my-classes')}>
                    {language === 'en' ? 'Browse Courses' : 'පන්ති බලන්න'}
                  </Button>
                </Box>
              ) : (
                enrollments.slice(0, 4).map((e) => (
                  <Card key={e.id} variant="outlined" sx={{ mb: 1.5, borderRadius: 2 }}>
                    <CardActionArea onClick={() => navigate(`/video-vault?course=${e.course_id}`)} sx={{ p: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.light', width: 42, height: 42 }}>
                          <PlayCircle />
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={600} noWrap>{e.course_title}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {language === 'en' ? `LKR ${e.monthly_fee}/month` : `මාසික ගාස්තුව: රු. ${e.monthly_fee}`}
                          </Typography>
                        </Box>
                        <Chip label={e.enrollment_status === 'active' ? (language === 'en' ? 'Active' : 'ක්‍රියාකාරී') : e.enrollment_status} size="small"
                          color={e.enrollment_status === 'active' ? 'success' : 'default'} />
                      </Box>
                    </CardActionArea>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Progress + Recent activity */}
        <Grid item xs={12} md={5}>
          {/* Weak areas */}
          <Card sx={{ mb: 2.5 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="h6" fontWeight={600}>
                  {language === 'en' ? 'Topic Accuracy' : 'විෂය කොටස් අනුව නිවැරදිභාවය'}
                </Typography>
                <Button size="small" onClick={() => navigate('/progress')}>
                  {language === 'en' ? 'Details' : 'විස්තර'}
                </Button>
              </Box>
              {loadProgress ? (
                [1, 2, 3].map((k) => <Skeleton key={k} variant="text" height={36} />)
              ) : (progress.topic_stats || []).slice(0, 5).map((t) => (
                <Box key={t.topic} sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                    <Typography variant="caption" fontWeight={500}>{t.topic}</Typography>
                    <Typography variant="caption" color={t.accuracy < 50 ? 'error.main' : 'success.main'} fontWeight={600}>
                      {t.accuracy}%
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={t.accuracy}
                    color={t.accuracy < 50 ? 'error' : t.accuracy < 70 ? 'warning' : 'success'}
                    sx={{ height: 6, borderRadius: 3 }} />
                </Box>
              ))}
              {!(progress.topic_stats?.length) && !loadProgress && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  {language === 'en' ? 'Take a quiz to see your topic breakdown!' : 'විෂය කොටස්වල දක්ෂතා බැලීමට ප්‍රශ්න පත්‍රයකට මුහුණ දෙන්න!'}
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Recent lessons attended */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1.5 }}>
                {language === 'en' ? 'Recent Classes' : 'මෑතකදී සහභාගී වූ පන්ති'}
              </Typography>
              {recentLessons.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  {language === 'en' ? 'No classes attended yet' : 'තවමත් කිසිදු පන්තියකට සහභාගී වී නැත'}
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {recentLessons.map((a) => (
                    <Box key={a.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1, borderRadius: 1.5, bgcolor: 'background.default' }}>
                      <EmojiEvents sx={{ color: 'secondary.main', fontSize: 20 }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="caption" fontWeight={600} noWrap>{a.lesson_title}</Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {new Date(a.joined_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Chip label={a.mode === 'online' ? (language === 'en' ? 'Online' : 'සජීවී') : a.mode} size="small" variant="outlined" sx={{ fontSize: 10 }} />
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick actions */}
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {[
          { label: language === 'en' ? 'Watch a Lecture' : 'දේශන නරඹන්න', icon: <PlayCircle />, path: '/video-vault', color: '#1565C0' },
          { label: language === 'en' ? 'Take a Quiz' : 'ප්‍රශ්න පත්‍රයකට මුහුණ දෙන්න', icon: <Quiz />, path: '/quiz', color: '#F57C00' },
          { label: language === 'en' ? 'Submit Work' : 'පැවරුම් භාර දෙන්න', icon: <Assignment />, path: '/assignments', color: '#2E7D32' },
          { label: language === 'en' ? 'My Progress' : 'මගේ ප්‍රගතිය', icon: <TrendingUp />, path: '/progress', color: '#6A1B9A' },
        ].map(({ label, icon, path, color }) => (
          <Grid item xs={6} md={3} key={label}>
            <Card sx={{ cursor: 'pointer', '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }, transition: 'all .2s' }}
              onClick={() => navigate(path)}>
              <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
                <Avatar sx={{ bgcolor: `${color}18`, color, width: 48, height: 48, mx: 'auto', mb: 1 }}>{icon}</Avatar>
                <Typography variant="body2" fontWeight={600}>{label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
