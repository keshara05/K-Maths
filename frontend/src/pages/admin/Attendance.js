import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box, Typography, Card, CardContent, Stack, Chip, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Select, MenuItem, FormControl, InputLabel, LinearProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Alert, Avatar, Grid,
} from '@mui/material';
import {
  HowToReg, PersonAdd, BarChart, School,
} from '@mui/icons-material';
import {
  BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';
import { attendanceApi, courseApi, lessonApi } from '../../api';

export default function AdminAttendance() {
  const qc = useQueryClient();
  const [courseId,  setCourseId]  = useState('');
  const [lessonId,  setLessonId]  = useState('');
  const [markOpen,  setMarkOpen]  = useState(false);
  const [markForm,  setMarkForm]  = useState({ student_id: '', lesson_id: '', mode: 'physical' });

  const { data: courses } = useQuery('all-courses',
    () => courseApi.list().then((r) => r.data.courses));

  const { data: lessons } = useQuery(
    ['lessons', courseId],
    () => lessonApi.byCourse(courseId).then((r) => r.data.lessons),
    { enabled: !!courseId }
  );

  const { data: summary, isLoading: loadingSummary } = useQuery(
    ['attendance-summary', courseId],
    () => attendanceApi.summary(courseId ? { course_id: courseId } : {}).then((r) => r.data.lessons),
    { keepPreviousData: true }
  );

  const { data: lessonAttendance, isLoading: loadingLesson } = useQuery(
    ['lesson-attendance', lessonId],
    () => attendanceApi.lesson(lessonId).then((r) => r.data),
    { enabled: !!lessonId }
  );

  const markMutation = useMutation(
    (data) => attendanceApi.mark(data),
    {
      onSuccess: () => {
        qc.invalidateQueries('lesson-attendance');
        qc.invalidateQueries('attendance-summary');
        setMarkOpen(false);
        setMarkForm({ student_id: '', lesson_id: lessonId, mode: 'physical' });
      },
    }
  );

  const chartData = (summary || []).slice(0, 10).map((l) => ({
    lesson: l.title.length > 16 ? l.title.slice(0, 16) + '…' : l.title,
    attended: parseInt(l.attended_count),
  }));

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={0.5}>Attendance</Typography>
      <Typography color="text.secondary" mb={3}>Track student presence across classes</Typography>

      {/* Course + Lesson selectors */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3}>
        <FormControl sx={{ minWidth: 240 }}>
          <InputLabel>Course</InputLabel>
          <Select value={courseId} label="Course" onChange={(e) => { setCourseId(e.target.value); setLessonId(''); }}>
            <MenuItem value="">All Courses</MenuItem>
            {(courses || []).map((c) => <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>)}
          </Select>
        </FormControl>
        {courseId && (
          <FormControl sx={{ minWidth: 240 }}>
            <InputLabel>Lesson (drill-down)</InputLabel>
            <Select value={lessonId} label="Lesson (drill-down)" onChange={(e) => setLessonId(e.target.value)}>
              <MenuItem value="">— Select Lesson —</MenuItem>
              {(lessons || []).map((l) => (
                <MenuItem key={l.id} value={l.id}>
                  {l.title} {l.scheduled_at ? `· ${dayjs(l.scheduled_at).format('MMM D')}` : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        {lessonId && (
          <Button
            variant="outlined"
            startIcon={<PersonAdd />}
            onClick={() => { setMarkForm({ student_id: '', lesson_id: lessonId, mode: 'physical' }); setMarkOpen(true); }}
          >
            Mark Attendance
          </Button>
        )}
      </Stack>

      {/* Attendance chart */}
      {!lessonId && chartData.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <BarChart color="primary" />
              <Typography variant="h6" fontWeight={600}>Attendance per Lesson</Typography>
            </Stack>
            <ResponsiveContainer width="100%" height={220}>
              <RechartsBar data={chartData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="lesson" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="attended" fill="#1565C0" radius={[4, 4, 0, 0]} name="Students" />
              </RechartsBar>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Summary table (no lesson selected) */}
      {!lessonId && (
        <>
          {loadingSummary && <LinearProgress />}
          <TableContainer component={Card}>
            <Table>
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'grey.50' } }}>
                  <TableCell>Lesson</TableCell>
                  <TableCell>Course</TableCell>
                  <TableCell>Scheduled</TableCell>
                  <TableCell>Attended</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(summary || []).map((l) => (
                  <TableRow
                    key={l.lesson_id} hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => { setCourseId(l.course_id); setLessonId(l.lesson_id); }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{l.title}</Typography>
                    </TableCell>
                    <TableCell><Typography variant="body2">{l.course_title}</Typography></TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {l.scheduled_at ? dayjs(l.scheduled_at).format('MMM D, YYYY HH:mm') : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<HowToReg />}
                        label={l.attended_count}
                        color={l.attended_count > 0 ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {!loadingSummary && !summary?.length && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No attendance data yet</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Per-lesson attendance roster */}
      {lessonId && (
        <>
          {loadingLesson && <LinearProgress />}
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={600}>
                  Attendance Roster
                </Typography>
                <Chip
                  icon={<HowToReg />}
                  label={`${lessonAttendance?.count || 0} students`}
                  color="primary"
                />
              </Stack>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Mode</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Joined At</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Left At</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Duration</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(lessonAttendance?.attendance || []).map((a) => {
                    const dur = a.left_at
                      ? dayjs(a.left_at).diff(dayjs(a.joined_at), 'minute')
                      : null;
                    return (
                      <TableRow key={a.id} hover>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: 'primary.light', color: 'primary.dark' }}>
                              {a.full_name?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>{a.full_name}</Typography>
                              <Typography variant="caption" color="text.secondary">{a.email}</Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={a.mode}
                            color={a.mode === 'online' ? 'info' : 'secondary'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">{dayjs(a.joined_at).format('HH:mm')}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">{a.left_at ? dayjs(a.left_at).format('HH:mm') : 'Still in'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">{dur != null ? `${dur} min` : '—'}</Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!loadingLesson && !lessonAttendance?.attendance?.length && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        <Typography color="text.secondary">No students attended this lesson</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {/* Manual mark dialog */}
      <Dialog open={markOpen} onClose={() => setMarkOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Mark Attendance</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Student ID (UUID)"
              value={markForm.student_id}
              onChange={(e) => setMarkForm((f) => ({ ...f, student_id: e.target.value }))}
              fullWidth
              placeholder="Paste student UUID"
            />
            <FormControl fullWidth>
              <InputLabel>Mode</InputLabel>
              <Select
                value={markForm.mode}
                label="Mode"
                onChange={(e) => setMarkForm((f) => ({ ...f, mode: e.target.value }))}
              >
                <MenuItem value="physical">Physical</MenuItem>
                <MenuItem value="online">Online</MenuItem>
              </Select>
            </FormControl>
            {markMutation.isError && <Alert severity="error">Failed to mark attendance.</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMarkOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<HowToReg />}
            onClick={() => markMutation.mutate(markForm)}
            disabled={!markForm.student_id || markMutation.isLoading}
          >
            Mark Present
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
