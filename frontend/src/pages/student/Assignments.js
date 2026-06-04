// ─── Assignments.js ───────────────────────────────────────────────────────────
import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box, Card, CardContent, Typography, Button, Grid, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Alert, LinearProgress, Skeleton,
} from '@mui/material';
import { Assignment, Upload, CheckCircle, Schedule } from '@mui/icons-material';
import { assignmentApi } from '../../api';

export default function Assignments() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState(null);
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [msg, setMsg] = useState(null);
  const fileRef = useRef();

  const { data, isLoading } = useQuery('assignments', () => assignmentApi.list().then((r) => r.data));
  const assignments = data?.assignments || [];

  const { mutate: submit, isLoading: uploading } = useMutation(
    () => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('notes', notes);
      return assignmentApi.submit(selected.id, fd);
    },
    {
      onSuccess: () => {
        qc.invalidateQueries('assignments');
        setMsg({ type: 'success', text: 'Assignment submitted successfully!' });
        setSelected(null); setFile(null); setNotes('');
      },
      onError: (e) => setMsg({ type: 'error', text: e.response?.data?.error || 'Upload failed' }),
    }
  );

  const statusColor = (a) => {
    if (a.submission_id) return 'success';
    if (a.due_date && new Date(a.due_date) < new Date()) return 'error';
    return 'warning';
  };
  const statusLabel = (a) => a.submission_id ? 'Submitted' : a.due_date && new Date(a.due_date) < new Date() ? 'Overdue' : 'Pending';

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>Assignments</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Submit your coursework and view feedback</Typography>

      {msg && <Alert severity={msg.type} sx={{ mb: 2 }} onClose={() => setMsg(null)}>{msg.text}</Alert>}

      <Grid container spacing={2}>
        {isLoading ? [1,2,3].map((k) => <Grid item xs={12} md={6} key={k}><Skeleton variant="rounded" height={160} /></Grid>)
        : assignments.length === 0 ? (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Assignment sx={{ fontSize: 64, color: 'text.disabled' }} />
              <Typography color="text.secondary" sx={{ mt: 1 }}>No assignments yet</Typography>
            </Box>
          </Grid>
        ) : assignments.map((a) => (
          <Grid item xs={12} md={6} key={a.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>{a.title}</Typography>
                  <Chip label={statusLabel(a)} size="small" color={statusColor(a)} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>{a.description}</Typography>
                <Typography variant="caption" color="text.secondary">
                  📚 {a.course_title}
                  {a.due_date && ` · Due: ${new Date(a.due_date).toLocaleDateString()}`}
                  {` · Max: ${a.max_marks} marks`}
                </Typography>
                {a.submission_id && (
                  <Box sx={{ mt: 1.5, p: 1.5, bgcolor: 'success.50', borderRadius: 1.5, bgcolor: '#E8F5E9' }}>
                    <Typography variant="caption" color="success.dark">
                      ✓ Submitted {new Date(a.submitted_at).toLocaleDateString()}
                      {a.marks != null && ` · Marks: ${a.marks}/${a.max_marks}`}
                    </Typography>
                    {a.feedback && <Typography variant="caption" display="block" color="text.secondary">Feedback: {a.feedback}</Typography>}
                  </Box>
                )}
                {!a.submission_id && (
                  <Button variant="outlined" size="small" startIcon={<Upload />} sx={{ mt: 1.5 }} onClick={() => setSelected(a)}>
                    Submit
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Submit: {selected?.title}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Button variant="outlined" fullWidth startIcon={<Upload />} onClick={() => fileRef.current.click()} sx={{ mb: 2, py: 1.5 }}>
              {file ? file.name : 'Choose File (PDF, Image, Word)'}
            </Button>
            <input ref={fileRef} type="file" hidden accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(e) => setFile(e.target.files[0])} />
            <TextField fullWidth multiline rows={3} label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
            {uploading && <LinearProgress sx={{ mt: 2 }} />}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Cancel</Button>
          <Button variant="contained" disabled={!file || uploading} onClick={() => submit()}>
            {uploading ? 'Uploading…' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
