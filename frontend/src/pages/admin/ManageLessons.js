import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box, Card, CardContent, Typography, Button, Grid, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Select, FormControl, InputLabel, Switch, FormControlLabel,
  Alert, LinearProgress, Skeleton, IconButton, Tooltip, Table,
  TableHead, TableRow, TableCell, TableBody,
} from '@mui/material';
import { Add, Upload, Edit, Delete, VideoLibrary } from '@mui/icons-material';
import { courseApi, lessonApi } from '../../api';

const LESSON_TYPES = ['recorded', 'live', 'zoom', 'pdf'];

export default function ManageLessons() {
  const qc = useQueryClient();
  const fileRef = useRef();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [open, setOpen] = useState(false);
  const [uploadTarget, setUploadTarget] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', type: 'recorded', zoom_link: '', scheduled_at: '', duration_min: '', sort_order: '0', is_published: false });

  const { data: courseData } = useQuery('courses-list', () => courseApi.list().then((r) => r.data));
  const courses = courseData?.courses || [];

  const { data: lessonData, isLoading } = useQuery(
    ['admin-lessons', selectedCourse],
    () => lessonApi.byCourse(selectedCourse).then((r) => r.data),
    { enabled: !!selectedCourse }
  );
  const lessons = lessonData?.lessons || [];

  const { mutate: createLesson, isLoading: creating } = useMutation(
    () => lessonApi.create({ ...form, course_id: selectedCourse, duration_min: Number(form.duration_min) || undefined, sort_order: Number(form.sort_order) }),
    {
      onSuccess: () => { qc.invalidateQueries(['admin-lessons', selectedCourse]); setOpen(false); setMsg({ type: 'success', text: 'Lesson created!' }); },
      onError: (e) => setMsg({ type: 'error', text: e.response?.data?.error || 'Error creating lesson' }),
    }
  );

  const { mutate: deleteLesson } = useMutation((id) => lessonApi.delete(id), {
    onSuccess: () => qc.invalidateQueries(['admin-lessons', selectedCourse]),
  });

  const { mutate: togglePublish } = useMutation(
    ({ id, is_published }) => lessonApi.update(id, { is_published }),
    { onSuccess: () => qc.invalidateQueries(['admin-lessons', selectedCourse]) }
  );

  const handleVideoUpload = async () => {
    if (!videoFile || !uploadTarget) return;
    const fd = new FormData();
    fd.append('video', videoFile);
    try {
      await lessonApi.uploadVideo(uploadTarget, fd, (pct) => setUploadProgress(pct));
      setMsg({ type: 'success', text: 'Video uploaded!' });
      qc.invalidateQueries(['admin-lessons', selectedCourse]);
      setUploadTarget(null); setVideoFile(null); setUploadProgress(0);
    } catch {
      setMsg({ type: 'error', text: 'Upload failed' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Manage Lessons</Typography>
          <Typography variant="body2" color="text.secondary">Upload videos and manage lesson content</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} disabled={!selectedCourse} onClick={() => setOpen(true)}>New Lesson</Button>
      </Box>

      {msg && <Alert severity={msg.type} sx={{ mb: 2 }} onClose={() => setMsg(null)}>{msg.text}</Alert>}

      <FormControl size="small" sx={{ minWidth: 280, mb: 3 }}>
        <InputLabel>Select Course</InputLabel>
        <Select value={selectedCourse} label="Select Course" onChange={(e) => setSelectedCourse(e.target.value)}>
          {courses.map((c) => <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>)}
        </Select>
      </FormControl>

      {uploadTarget && (
        <Card sx={{ mb: 2, border: '2px dashed', borderColor: 'primary.main' }}>
          <CardContent>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Upload Video for Lesson</Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Button variant="outlined" startIcon={<Upload />} onClick={() => fileRef.current.click()}>
                {videoFile ? videoFile.name : 'Choose MP4 / MKV'}
              </Button>
              <input ref={fileRef} type="file" hidden accept="video/mp4,video/x-matroska,video/quicktime" onChange={(e) => setVideoFile(e.target.files[0])} />
              <Button variant="contained" disabled={!videoFile} onClick={handleVideoUpload}>Upload</Button>
              <Button onClick={() => { setUploadTarget(null); setVideoFile(null); setUploadProgress(0); }}>Cancel</Button>
            </Box>
            {uploadProgress > 0 && <LinearProgress variant="determinate" value={uploadProgress} sx={{ mt: 1.5, height: 8, borderRadius: 4 }} />}
          </CardContent>
        </Card>
      )}

      {selectedCourse && (
        <Card>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell><strong>Title</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Duration</strong></TableCell>
                    <TableCell><strong>Scheduled</strong></TableCell>
                    <TableCell><strong>Video</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? [1,2,3].map((k) => (
                    <TableRow key={k}>{[1,2,3,4,5,6,7,8].map((j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
                  )) : lessons.map((l, i) => (
                    <TableRow key={l.id} hover>
                      <TableCell>{l.sort_order ?? i+1}</TableCell>
                      <TableCell><Typography variant="body2" fontWeight={500}>{l.title}</Typography></TableCell>
                      <TableCell><Chip label={l.type} size="small" color={l.type === 'live' ? 'error' : l.type === 'zoom' ? 'warning' : 'primary'} /></TableCell>
                      <TableCell>{l.duration_min ? `${l.duration_min} min` : '—'}</TableCell>
                      <TableCell><Typography variant="caption">{l.scheduled_at ? new Date(l.scheduled_at).toLocaleString() : '—'}</Typography></TableCell>
                      <TableCell>
                        {l.video_url ? (
                          <Chip label="Uploaded" size="small" color="success" />
                        ) : l.type === 'recorded' ? (
                          <Button size="small" startIcon={<Upload />} onClick={() => setUploadTarget(l.id)}>Upload</Button>
                        ) : '—'}
                      </TableCell>
                      <TableCell>
                        <Chip label={l.is_published ? 'Published' : 'Draft'} size="small" color={l.is_published ? 'success' : 'default'} />
                      </TableCell>
                      <TableCell>
                        <Tooltip title={l.is_published ? 'Unpublish' : 'Publish'}>
                          <Switch size="small" checked={l.is_published} onChange={() => togglePublish({ id: l.id, is_published: !l.is_published })} />
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => { if(window.confirm('Delete lesson?')) deleteLesson(l.id); }}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </CardContent>
        </Card>
      )}

      {!selectedCourse && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <VideoLibrary sx={{ fontSize: 64, color: 'text.disabled' }} />
          <Typography color="text.secondary" sx={{ mt: 1 }}>Select a course to manage its lessons</Typography>
        </Box>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Lesson</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField fullWidth label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <TextField fullWidth label="Description" multiline rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select value={form.type} label="Type" onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {LESSON_TYPES.map((t) => <MenuItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</MenuItem>)}
              </Select>
            </FormControl>
            {form.type === 'zoom' && <TextField fullWidth label="Zoom Link" value={form.zoom_link} onChange={(e) => setForm({ ...form, zoom_link: e.target.value })} />}
            <TextField fullWidth label="Scheduled At" type="datetime-local" InputLabelProps={{ shrink: true }} value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Duration (min)" type="number" value={form.duration_min} onChange={(e) => setForm({ ...form, duration_min: e.target.value })} sx={{ flex: 1 }} />
              <TextField label="Sort Order" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} sx={{ flex: 1 }} />
            </Box>
            <FormControlLabel control={<Switch checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />} label="Published immediately" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={creating || !form.title} onClick={() => createLesson()}>
            {creating ? 'Creating…' : 'Create Lesson'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
