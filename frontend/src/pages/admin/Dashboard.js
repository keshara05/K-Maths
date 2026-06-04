import React from 'react';
import { useQuery } from 'react-query';
import {
  Box, Grid, Card, CardContent, Typography, CircularProgress, Alert,
} from '@mui/material';
import { People, School, Payment, EventNote } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import StatCard from '../../components/common/StatCard';
import { adminApi } from '../../api';

export default function AdminDashboard() {
  const { data: ov, isLoading: loadOv } = useQuery('admin-overview', () => adminApi.overview().then((r) => r.data));
  const { data: eng, isLoading: loadEng } = useQuery('admin-engagement', () => adminApi.engagement().then((r) => r.data));

  const overview = ov || {};
  const daily = eng?.daily_active || [];
  const courseStats = eng?.course_stats || [];
  const topStudents = eng?.top_students || [];

  const revenueData = []; // Populated from payment summary if needed

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>Dashboard</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>K-Maths platform overview</Typography>

      {/* KPI cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Students" value={overview.students?.total || 0}
            subtitle={`+${overview.students?.new_this_month || 0} this month`}
            icon={<People />} color="primary.main" loading={loadOv} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Revenue" value={`LKR ${Number(overview.revenue?.total_revenue || 0).toLocaleString()}`}
            subtitle={`LKR ${Number(overview.revenue?.this_month || 0).toLocaleString()} this month`}
            icon={<Payment />} color="success.main" loading={loadOv} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Courses" value={`${overview.courses?.published || 0} active`}
            subtitle={`${overview.courses?.total || 0} total`}
            icon={<School />} color="secondary.main" loading={loadOv} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Avg Attendance" value={`${Math.round(overview.attendance?.avg_per_lesson || 0)}/session`}
            subtitle={`${overview.attendance?.total_sessions || 0} total sessions`}
            icon={<EventNote />} color="info.main" loading={loadOv} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Daily active students */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>Daily Active Students (30 days)</Typography>
              {loadEng ? <Box sx={{ height: 240, display:'flex', alignItems:'center', justifyContent:'center' }}><CircularProgress /></Box> : (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={daily}>
                    <defs>
                      <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1565C0" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#1565C0" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip labelFormatter={(d) => new Date(d).toLocaleDateString()} formatter={(v) => [v, 'Active students']} />
                    <Area type="monotone" dataKey="active_students" stroke="#1565C0" strokeWidth={2} fill="url(#colorStudents)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Course enrollments */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>Enrollments by Course</Typography>
              {loadEng ? <Box sx={{ height: 240, display:'flex', alignItems:'center', justifyContent:'center' }}><CircularProgress /></Box> : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={courseStats.slice(0, 6)} layout="vertical" margin={{ left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="title" tick={{ fontSize: 11 }} width={90}
                      tickFormatter={(v) => v.length > 12 ? v.slice(0, 12) + '…' : v} />
                    <Tooltip />
                    <Bar dataKey="active" name="Active" fill="#1565C0" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top students */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Top Performing Students</Typography>
              {loadEng ? <CircularProgress size={24} /> : topStudents.length === 0 ? (
                <Typography color="text.secondary">No quiz data yet</Typography>
              ) : (
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {topStudents.slice(0, 8).map((s, i) => (
                    <Box key={s.email} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', minWidth: 180, textAlign: 'center' }}>
                      <Typography variant="h6" color={i === 0 ? 'warning.main' : 'primary.main'} fontWeight={700}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
                      </Typography>
                      <Typography variant="body2" fontWeight={600} noWrap>{s.full_name}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block">{Math.round(s.avg_score)}% avg</Typography>
                      <Typography variant="caption" color="text.secondary">{s.quizzes_taken} quizzes</Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
