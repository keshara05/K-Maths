import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box, Card, CardContent, Typography, Button, Grid, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Alert, Skeleton, FormControlLabel, Switch, LinearProgress,
} from '@mui/material';
import {
  Add, Delete, PictureAsPdf, CloudUpload, LibraryBooks, Download,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { resourceApi, courseApi } from '../../api';

const TYPE_LABELS = { notes: 'Study Notes', past_paper: 'Past Paper', model_paper: 'Model Paper', tutorial: 'Tutorial' };
const TYPE_COLORS = { notes: 'primary', past_paper: 'secondary', model_paper: 'success', tutorial: 'info' };

function UploadDialog({ open, onClose }) {
  const qc = useQueryClient();
  const fileRef = useRef();
  const [file, setFile]       = useState(null);
  const [progress, setProgress] = useState(0);
  const { data: coursesData } = useQuery('courses-all', () => courseApi.list().then(r => r.data));
  const courses = coursesData?.courses || [];

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { title: '', description: '', type: 'notes', course_id: '', year: '', is_public: false },
  });

  const mutation = useMutation(
    (formData) => resourceApi.create(formData),
    { onSuccess: () => { qc.invalidateQueries('admin-resources'); reset(); setFile(null); setProgress(0); onClose(); } },
  );

  const onSubmit = (data) => {
    if (!file) return;
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => v !== '' && fd.append(k, v));
    fd.append('file', file);
    mutation.mutate(fd);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudUpload color="primary" /> Upload Resource
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {mutation.error && <Alert severity="error" sx={{ mb: 2 }}>{mutation.error.response?.data?.error}</Alert>}

        {/* File drop zone */}
        <Box
          sx={{
            border: '2px dashed', borderColor: file ? 'success.main' : 'divider',
            borderRadius: 2, p: 3, textAlign: 'center', cursor: 'pointer', mb: 2,
            bgcolor: file ? 'success.50' : 'background.default',
            transition: 'all 0.2s',
            '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.50' },
          }}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); setFile(e.dataTransfer.files[0]); }}
        >
          <input ref={fileRef} type="file" accept=".pdf" hidden onChange={e => setFile(e.target.files[0])} />
          <PictureAsPdf sx={{ fontSize: 40, color: file ? 'success.main' : 'text.disabled', mb: 1 }} />
          {file ? (
            <>
              <Typography variant="body2" fontWeight={600} color="success.main">{file.name}</Typography>
              <Typography variant="caption" color="text.secondary">{(file.size / 1024).toFixed(0)} KB</Typography>
            </>
          ) : (
            <>
              <Typography variant="body2" fontWeight={600}>Click or drag PDF here</Typography>
              <Typography variant="caption" color="text.secondary">PDF files only · Max 50 MB</Typography>
            </>
          )}
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Controller name="title" control={control} rules={{ required: 'Title is required' }}
              render={({ field, fieldState }) => (
                <TextField {...field} fullWidth label="Title" error={!!fieldState.error} helperText={fieldState.error?.message} />
              )} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller name="type" control={control}
              render={({ field }) => (
                <TextField {...field} select fullWidth label="Type">
                  {Object.entries(TYPE_LABELS).map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
                </TextField>
              )} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller name="course_id" control={control}
              render={({ field }) => (
                <TextField {...field} select fullWidth label="Course (optional)">
                  <MenuItem value="">All courses / General</MenuItem>
                  {courses.map(c => <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>)}
                </TextField>
              )} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller name="year" control={control}
              render={({ field }) => (
                <TextField {...field} fullWidth type="number" label="Year (for past papers)" inputProps={{ min: 2000, max: 2099 }} />
              )} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller name="is_public" control={control}
              render={({ field }) => (
                <FormControlLabel control={<Switch {...field} checked={field.value} />}
                  label="Public (no enrollment needed)" sx={{ mt: 1 }} />
              )} />
          </Grid>
          <Grid item xs={12}>
            <Controller name="description" control={control}
              render={({ field }) => (
                <TextField {...field} fullWidth multiline rows={2} label="Description (optional)" />
              )} />
          </Grid>
        </Grid>

        {mutation.isLoading && <LinearProgress sx={{ mt: 2 }} />}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit(onSubmit)}
          disabled={mutation.isLoading || !file} startIcon={<CloudUpload />}>
          {mutation.isLoading ? 'Uploading…' : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function AdminResources() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery(
    ['admin-resources', typeFilter],
    () => resourceApi.list(typeFilter ? { type: typeFilter } : {}).then(r => r.data),
  );
  const resources = data?.resources || [];

  const deleteMutation = useMutation((id) => resourceApi.delete(id), {
    onSuccess: () => qc.invalidateQueries('admin-resources'),
  });

  const handleDownload = async (r) => {
    const { data: res } = await resourceApi.download(r.id);
    window.open(res.url, '_blank');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Resource Library</Typography>
          <Typography variant="body2" color="text.secondary">Manage study materials, past papers, and notes</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setUploadOpen(true)}>
          Upload Resource
        </Button>
      </Box>

      {/* Type filter chips */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        {[{ v: '', l: 'All' }, ...Object.entries(TYPE_LABELS).map(([v, l]) => ({ v, l }))].map(({ v, l }) => (
          <Chip key={v} label={l} onClick={() => setTypeFilter(v)}
            color={typeFilter === v ? 'primary' : 'default'}
            variant={typeFilter === v ? 'filled' : 'outlined'} />
        ))}
      </Box>

      {isLoading ? (
        <Grid container spacing={2}>
          {[1,2,3,4].map(k => <Grid item xs={12} sm={6} md={4} key={k}><Skeleton variant="rounded" height={150} /></Grid>)}
        </Grid>
      ) : resources.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <LibraryBooks sx={{ fontSize: 64, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">No resources yet. Upload your first one!</Typography>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {resources.map(r => (
            <Grid item xs={12} sm={6} md={4} key={r.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                    <Chip label={TYPE_LABELS[r.type] || r.type} size="small"
                      color={TYPE_COLORS[r.type] || 'default'} />
                    {r.year && <Chip label={r.year} size="small" variant="outlined" />}
                    {r.is_public && <Chip label="Public" size="small" color="success" variant="outlined" />}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <PictureAsPdf sx={{ color: 'error.main', mt: 0.25, flexShrink: 0 }} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>{r.title}</Typography>
                      {r.course_title && (
                        <Typography variant="caption" color="text.secondary" display="block">📚 {r.course_title}</Typography>
                      )}
                      {r.description && (
                        <Typography variant="caption" color="text.secondary" display="block"
                          sx={{ mt: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {r.description}
                        </Typography>
                      )}
                      {r.file_size && (
                        <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 0.5 }}>
                          {(r.file_size / 1024).toFixed(0)} KB · {new Date(r.created_at).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
                <Box sx={{ px: 2, pb: 2, display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined" startIcon={<Download />}
                    onClick={() => handleDownload(r)} sx={{ flex: 1 }}>
                    Preview
                  </Button>
                  <IconButton size="small" color="error"
                    onClick={() => window.confirm('Delete this resource?') && deleteMutation.mutate(r.id)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </Box>
  );
}
