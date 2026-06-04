import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, CardMedia, CardActions, Typography,
  Button, Chip, TextField, InputAdornment, Alert, Skeleton, Tabs, Tab,
} from '@mui/material';
import { Search, PlayCircle, School, CheckCircle } from '@mui/icons-material';
import { courseApi, enrollmentApi } from '../../api';

const CourseCard = ({ course, enrolled, onEnroll, enrolling }) => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }, transition: 'all .2s' }}>
    <CardMedia
      component="div"
      sx={{ height: 140, bgcolor: 'primary.light', backgroundImage: course.thumbnail_url ? `url(${course.thumbnail_url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {!course.thumbnail_url && <School sx={{ fontSize: 56, color: '#fff', opacity: 0.7 }} />}
    </CardMedia>
    <CardContent sx={{ flex: 1 }}>
      <Chip label={course.topic_tag || 'Mathematics'} size="small" color="primary" variant="outlined" sx={{ mb: 1 }} />
      <Typography variant="h6" fontWeight={600} gutterBottom sx={{ lineHeight: 1.3 }}>{course.title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {course.description}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Typography variant="caption" color="text.secondary">📚 {course.lesson_count || 0} lessons</Typography>
        <Typography variant="caption" color="text.secondary">👥 {course.enrolled_count || 0} students</Typography>
      </Box>
    </CardContent>
    <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="subtitle1" fontWeight={700} color="primary">
        LKR {Number(course.monthly_fee).toLocaleString()}<Typography component="span" variant="caption" color="text.secondary">/mo</Typography>
      </Typography>
      {enrolled ? (
        <Chip icon={<CheckCircle />} label="Enrolled" color="success" size="small" />
      ) : (
        <Button variant="contained" size="small" onClick={() => onEnroll(course.id)} disabled={enrolling}>
          Enroll
        </Button>
      )}
    </CardActions>
  </Card>
);

export default function MyClasses() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [enrollMsg, setEnrollMsg] = useState(null);

  const { data: allData, isLoading: loadAll } = useQuery('all-courses', () => courseApi.list().then((r) => r.data));
  const { data: myData, isLoading: loadMine } = useQuery('my-courses', () => enrollmentApi.mine().then((r) => r.data));

  const allCourses = allData?.courses || [];
  const myEnrollments = myData?.enrollments || [];
  const enrolledIds = new Set(myEnrollments.map((e) => e.course_id));

  const { mutate: enroll, isLoading: enrolling } = useMutation(
    (courseId) => enrollmentApi.enroll(courseId),
    {
      onSuccess: (_, courseId) => {
        qc.invalidateQueries('my-courses');
        qc.invalidateQueries('all-courses');
        setEnrollMsg('Enrolled successfully! 🎉');
        setTimeout(() => setEnrollMsg(null), 3000);
      },
      onError: (err) => setEnrollMsg(err.response?.data?.error || 'Enrollment failed'),
    }
  );

  const filtered = (tab === 0 ? allCourses : myEnrollments.map((e) => ({ ...e, id: e.course_id, title: e.course_title }))).filter(
    (c) => c.title?.toLowerCase().includes(search.toLowerCase())
  );

  const loading = tab === 0 ? loadAll : loadMine;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Courses</Typography>
        <Typography variant="body2" color="text.secondary">Browse and enroll in available O/L Maths courses</Typography>
      </Box>

      {enrollMsg && <Alert severity={enrollMsg.includes('🎉') ? 'success' : 'error'} sx={{ mb: 2 }} onClose={() => setEnrollMsg(null)}>{enrollMsg}</Alert>}

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ flex: 1 }}>
          <Tab label={`All Courses (${allCourses.length})`} />
          <Tab label={`My Courses (${myEnrollments.length})`} />
        </Tabs>
        <TextField
          size="small" placeholder="Search courses…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
          sx={{ minWidth: 220 }}
        />
      </Box>

      {tab === 1 && myEnrollments.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {myEnrollments.map((e) => (
            <Button key={e.id} variant="outlined" size="small" startIcon={<PlayCircle />}
              onClick={() => navigate(`/video-vault?course=${e.course_id}`)}>
              {e.course_title}
            </Button>
          ))}
        </Box>
      )}

      <Grid container spacing={2.5}>
        {loading
          ? [1, 2, 3, 4].map((k) => (
              <Grid item xs={12} sm={6} md={4} key={k}>
                <Skeleton variant="rounded" height={320} />
              </Grid>
            ))
          : filtered.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course.id || course.course_id}>
                <CourseCard
                  course={course}
                  enrolled={enrolledIds.has(course.id || course.course_id)}
                  onEnroll={enroll}
                  enrolling={enrolling}
                />
              </Grid>
            ))}
        {!loading && filtered.length === 0 && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <School sx={{ fontSize: 64, color: 'text.disabled' }} />
              <Typography color="text.secondary" sx={{ mt: 1 }}>No courses found</Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
