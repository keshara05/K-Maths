// ManageCourses.js
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box, Card, CardContent, Typography, Button, Grid, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Switch, FormControlLabel, Alert, Skeleton, IconButton, Tooltip, Avatar,
} from '@mui/material';
import { Add, Edit, Delete, School, Visibility, VisibilityOff } from '@mui/icons-material';
import { courseApi } from '../../api';

export default function ManageCourses() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', topic_tag: '', monthly_fee: '', is_published: false });

  const { data, isLoading } = useQuery('admin-courses', () => courseApi.list().then((r) => r.data));
  const courses = data?.courses || [];

  const resetForm = () => { setForm({ title: '', description: '', topic_tag: '', monthly_fee: '', is_published: false }); setEditing(null); };

  const { mutate: save, isLoading: saving } = useMutation(
    () => editing ? courseApi.update(editing.id, form) : courseApi.create(form),
    {
      onSuccess: () => { qc.invalidateQueries('admin-courses'); setOpen(false); resetForm(); setMsg({ type: 'success', text: editing ? 'Course updated' : 'Course created' }); },
      onError: (e) => setMsg({ type: 'error', text: e.response?.data?.error || 'Error saving course' }),
    }
  );

  const { mutate: deleteCourse } = useMutation((id) => courseApi.delete(id), {
    onSuccess: () => { qc.invalidateQueries('admin-courses'); setMsg({ type: 'success', text: 'Course deleted' }); },
  });

  const { mutate: togglePublish } = useMutation(
    ({ id, is_published }) => courseApi.update(id, { is_published }),
    { onSuccess: () => qc.invalidateQueries('admin-courses') }
  );

  const openEdit = (c) => { setEditing(c); setForm({ title: c.title, description: c.description || '', topic_tag: c.topic_tag || '', monthly_fee: c.monthly_fee, is_published: c.is_published }); setOpen(true); };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Manage Courses</Typography>
          <Typography variant="body2" color="text.secondary">Create and manage O/L Maths courses</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => { resetForm(); setOpen(true); }}>New Course</Button>
      </Box>

      {msg && <Alert severity={msg.type} sx={{ mb: 2 }} onClose={() => setMsg(null)}>{msg.text}</Alert>}

      <Grid container spacing={2.5}>
        {isLoading ? [1,2,3].map((k) => <Grid item xs={12} md={6} key={k}><Skeleton variant="rounded" height={180} /></Grid>)
        : courses.map((c) => (
          <Grid item xs={12} md={6} lg={4} key={c.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Chip label={c.topic_tag || 'Maths'} size="small" color="primary" variant="outlined" />
                  <Chip label={c.is_published ? 'Published' : 'Draft'} size="small" color={c.is_published ? 'success' : 'default'} />
                </Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>{c.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {c.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">👥 {c.enrolled_count} enrolled</Typography>
                  <Typography variant="caption" color="text.secondary">📚 {c.lesson_count} lessons</Typography>
                </Box>
                <Typography variant="subtitle1" fontWeight={700} color="primary" sx={{ mb: 1.5 }}>
                  LKR {Number(c.monthly_fee).toLocaleString()}/month
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title={c.is_published ? 'Unpublish' : 'Publish'}>
                    <IconButton size="small" onClick={() => togglePublish({ id: c.id, is_published: !c.is_published })}>
                      {c.is_published ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => openEdit(c)} color="primary"><Edit fontSize="small" /></IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => { if(window.confirm('Delete this course?')) deleteCourse(c.id); }}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => { setOpen(false); resetForm(); }} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Course' : 'New Course'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 0.5 }}>
            <TextField fullWidth label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <TextField fullWidth label="Description" multiline rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <TextField fullWidth label="Topic Tag (e.g. Algebra, Geometry)" value={form.topic_tag} onChange={(e) => setForm({ ...form, topic_tag: e.target.value })} />
            <TextField fullWidth label="Monthly Fee (LKR)" type="number" value={form.monthly_fee} onChange={(e) => setForm({ ...form, monthly_fee: e.target.value })} required />
            <FormControlLabel control={<Switch checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />} label="Published (visible to students)" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpen(false); resetForm(); }}>Cancel</Button>
          <Button variant="contained" disabled={saving || !form.title || !form.monthly_fee} onClick={() => save()}>
            {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
