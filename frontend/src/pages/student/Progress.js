import React from 'react';
import { useQuery } from 'react-query';
import {
  Box, Grid, Card, CardContent, Typography, LinearProgress,
  Chip, CircularProgress, Alert,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Cell } from 'recharts';
import { TrendingUp, Quiz, EventNote, EmojiEvents } from '@mui/icons-material';
import StatCard from '../../components/common/StatCard';
import { quizApi } from '../../api';

export default function Progress() {
  const { data, isLoading, error } = useQuery('progress', () => quizApi.progress().then((r) => r.data));

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Failed to load progress data</Alert>;

  const { overall = {}, topic_stats = [], attendance = {} } = data || {};

  const radarData = topic_stats.map((t) => ({ subject: t.topic, accuracy: t.accuracy, fullMark: 100 }));

  const barData = topic_stats.map((t) => ({
    topic: t.topic.length > 12 ? t.topic.slice(0, 12) + '…' : t.topic,
    accuracy: t.accuracy,
    correct: t.correct,
    total: t.total,
  }));

  const getColor = (accuracy) => accuracy >= 70 ? '#2E7D32' : accuracy >= 40 ? '#F57C00' : '#C62828';

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>My Progress</Typography>
        <Typography variant="body2" color="text.secondary">Track your learning journey and identify areas for improvement</Typography>
      </Box>

      {/* Summary stats */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Quizzes Taken" value={overall.quizzes_taken || 0} icon={<Quiz />} color="primary.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Avg Score" value={`${overall.avg_score || 0}%`} icon={<TrendingUp />} color={overall.avg_score >= 70 ? 'success.main' : overall.avg_score >= 40 ? 'warning.main' : 'error.main'} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Classes Attended" value={`${attendance.attended || 0}/${attendance.total || 0}`} icon={<EventNote />} color="info.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Attendance Rate" value={`${attendance.rate || 0}%`} icon={<EmojiEvents />} color={attendance.rate >= 75 ? 'success.main' : 'warning.main'} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Topic accuracy bars */}
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>Accuracy by Topic</Typography>
              {topic_stats.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Quiz sx={{ fontSize: 56, color: 'text.disabled' }} />
                  <Typography color="text.secondary" sx={{ mt: 1 }}>Take quizzes to see your topic breakdown</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={barData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="topic" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [`${v}%`, 'Accuracy']} />
                    <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
                      {barData.map((entry, i) => (
                        <Cell key={i} fill={getColor(entry.accuracy)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Radar chart */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>Skills Radar</Typography>
              {radarData.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <TrendingUp sx={{ fontSize: 56, color: 'text.disabled' }} />
                  <Typography color="text.secondary" sx={{ mt: 1 }}>No data yet</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                    <Radar name="Accuracy" dataKey="accuracy" stroke="#1565C0" fill="#1565C0" fillOpacity={0.25} />
                    <Tooltip formatter={(v) => [`${v}%`, 'Accuracy']} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Detailed topic breakdown */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Topic Breakdown</Typography>
              {topic_stats.length === 0 ? (
                <Typography color="text.secondary">No quiz data yet.</Typography>
              ) : (
                <Grid container spacing={2}>
                  {topic_stats.map((t) => (
                    <Grid item xs={12} sm={6} md={4} key={t.topic}>
                      <Box sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" fontWeight={600}>{t.topic}</Typography>
                          <Chip
                            label={`${t.accuracy}%`} size="small"
                            sx={{ bgcolor: getColor(t.accuracy) + '20', color: getColor(t.accuracy), fontWeight: 700 }}
                          />
                        </Box>
                        <LinearProgress
                          variant="determinate" value={t.accuracy}
                          sx={{ height: 8, borderRadius: 4, bgcolor: 'action.hover',
                            '& .MuiLinearProgress-bar': { bgcolor: getColor(t.accuracy) } }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          {t.correct}/{t.total} questions correct
                        </Typography>
                        {t.accuracy < 50 && (
                          <Chip label="Needs attention" size="small" color="error" variant="outlined" sx={{ mt: 0.5, fontSize: 10 }} />
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
