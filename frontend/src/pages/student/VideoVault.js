import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, CardActionArea, Typography, Chip,
  Select, MenuItem, FormControl, InputLabel, Avatar, Skeleton, Alert,
} from '@mui/material';
import { PlayCircle, Lock, VideoLibrary, LiveTv, PictureAsPdf } from '@mui/icons-material';
import { enrollmentApi, lessonApi } from '../../api';

const typeIcon = { recorded: <PlayCircle />, live: <LiveTv />, zoom: <LiveTv />, pdf: <PictureAsPdf /> };
const typeColor = { recorded: 'primary', live: 'error', zoom: 'warning', pdf: 'info' };

const LessonCard = ({ lesson, onClick }) => (
  <Card sx={{ '&:hover': { transform: 'translateY(-1px)', boxShadow: 3 }, transition: 'all .2s' }}>
    <CardActionArea onClick={onClick} disabled={!lesson.is_published && lesson.type === 'recorded'}>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <Avatar sx={{ bgcolor: lesson.attended ? 'success.light' : 'primary.light', width: 44, height: 44, mt: 0.25 }}>
            {typeIcon[lesson.type] || <PlayCircle />}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
              <Chip label={lesson.type} size="small" color={typeColor[lesson.type] || 'default'} />
              {lesson.attended && <Chip label="Watched" size="small" color="success" variant="outlined" />}
            </Box>
            <Typography variant="subtitle2" fontWeight={600}>{lesson.title}</Typography>
            {lesson.description && (
              <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {lesson.description}
              </Typography>
            )}
            <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
              {lesson.duration_min && <Typography variant="caption" color="text.secondary">⏱ {lesson.duration_min} min</Typography>}
              {lesson.scheduled_at && (
                <Typography variant="caption" color="text.secondary">
                  📅 {new Date(lesson.scheduled_at).toLocaleString()}
                </Typography>
              )}
            </Box>
          </Box>
          {lesson.type === 'recorded' && !lesson.video_url && <Lock sx={{ color: 'text.disabled', fontSize: 20 }} />}
        </Box>
      </CardContent>
    </CardActionArea>
  </Card>
);

export default function VideoVault() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [selectedCourse, setSelectedCourse] = useState(params.get('course') || '');

  const { data: enrollData } = useQuery('my-enrollments-vault', () => enrollmentApi.mine().then((r) => r.data));
  const enrollments = enrollData?.enrollments || [];

  const { data: lessonData, isLoading, error } = useQuery(
    ['lessons', selectedCourse],
    () => lessonApi.byCourse(selectedCourse).then((r) => r.data),
    { enabled: !!selectedCourse }
  );
  const lessons = lessonData?.lessons || [];

  const handleLessonClick = (lesson) => {
    if (lesson.type === 'zoom' && lesson.zoom_link) {
      window.open(lesson.zoom_link, '_blank');
    } else if (lesson.type === 'recorded' && lesson.video_url) {
      navigate(`/video-vault/${lesson.id}`);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Video Vault</Typography>
        <Typography variant="body2" color="text.secondary">Access your recorded lectures and live sessions</Typography>
      </Box>

      <FormControl size="small" sx={{ minWidth: 280, mb: 3 }}>
        <InputLabel>Select Course</InputLabel>
        <Select value={selectedCourse} label="Select Course" onChange={(e) => setSelectedCourse(e.target.value)}>
          <MenuItem value="">— Choose a course —</MenuItem>
          {enrollments.map((e) => (
            <MenuItem key={e.course_id} value={e.course_id}>{e.course_title}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {!selectedCourse && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <VideoLibrary sx={{ fontSize: 72, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">Select a course to view lessons</Typography>
        </Box>
      )}

      {error && <Alert severity="error">Failed to load lessons. Please try again.</Alert>}

      {selectedCourse && (
        <Grid container spacing={2}>
          {isLoading
            ? [1, 2, 3].map((k) => <Grid item xs={12} md={6} key={k}><Skeleton variant="rounded" height={100} /></Grid>)
            : lessons.length === 0
            ? (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <PlayCircle sx={{ fontSize: 64, color: 'text.disabled' }} />
                  <Typography color="text.secondary" sx={{ mt: 1 }}>No lessons published yet</Typography>
                </Box>
              </Grid>
            )
            : lessons.map((lesson) => (
              <Grid item xs={12} md={6} key={lesson.id}>
                <LessonCard lesson={lesson} onClick={() => handleLessonClick(lesson)} />
              </Grid>
            ))}
        </Grid>
      )}
    </Box>
  );
}
