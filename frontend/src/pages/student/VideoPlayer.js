import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  Box, Card, CardContent, Typography, Button,
  Chip, CircularProgress, Alert, Breadcrumbs, Link,
} from '@mui/material';
import { ArrowBack, PlayCircle } from '@mui/icons-material';
import VideoPlayer from '../../components/video/VideoPlayer';
import { lessonApi, attendanceApi } from '../../api';

export default function VideoPlayerPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [videoUrl, setVideoUrl] = useState(null);
  const [urlError, setUrlError] = useState(null);
  const [attendanceMarked, setAttendanceMarked] = useState(false);

  const { data, isLoading, error } = useQuery(
    ['lesson', lessonId],
    () => lessonApi.get(lessonId).then((r) => r.data)
  );
  const lesson = data?.lesson;

  // Fetch signed video URL
  useEffect(() => {
    if (!lesson?.video_url) return;
    lessonApi.videoUrl(lessonId)
      .then((r) => setVideoUrl(r.data.url))
      .catch(() => setUrlError('Could not load video. Please try again.'));
  }, [lesson, lessonId]);

  // Auto-mark attendance when page loads
  useEffect(() => {
    if (!lessonId || attendanceMarked) return;
    attendanceApi.join(lessonId)
      .then(() => setAttendanceMarked(true))
      .catch(() => {});
  }, [lessonId]);

  // Mark left_at when unmounting
  useEffect(() => {
    return () => {
      if (attendanceMarked) {
        attendanceApi.leave(lessonId).catch(() => {});
      }
    };
  }, [attendanceMarked, lessonId]);

  if (isLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
  );
  if (error) return <Alert severity="error">Lesson not found</Alert>;

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component="button" variant="body2" onClick={() => navigate('/video-vault')} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <ArrowBack fontSize="small" /> Video Vault
        </Link>
        <Typography variant="body2" color="text.primary">{lesson?.title}</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight={700} sx={{ flex: 1 }}>{lesson?.title}</Typography>
        <Chip label={lesson?.type} color="primary" size="small" />
        {attendanceMarked && <Chip label="Attendance recorded ✓" color="success" size="small" />}
      </Box>

      {urlError && <Alert severity="error" sx={{ mb: 2 }}>{urlError}</Alert>}

      {lesson?.type === 'recorded' ? (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
            {videoUrl ? (
              <VideoPlayer src={videoUrl} title={lesson.title} />
            ) : !urlError ? (
              <Box sx={{ aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#111', borderRadius: 2 }}>
                <CircularProgress sx={{ color: '#fff' }} />
              </Box>
            ) : null}
          </CardContent>
        </Card>
      ) : lesson?.type === 'zoom' ? (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <PlayCircle sx={{ fontSize: 72, color: 'primary.light', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 2 }}>Live Class via Zoom</Typography>
            {lesson.scheduled_at && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Scheduled: {new Date(lesson.scheduled_at).toLocaleString()}
              </Typography>
            )}
            <Button variant="contained" size="large" onClick={() => window.open(lesson.zoom_link, '_blank')}>
              Join Zoom Class
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {lesson?.description && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>About this lesson</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
              {lesson.description}
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              {lesson.duration_min && (
                <Typography variant="caption" color="text.secondary">⏱ Duration: {lesson.duration_min} min</Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
