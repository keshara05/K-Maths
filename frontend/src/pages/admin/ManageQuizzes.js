import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box, Typography, Card, CardContent, Stack, Button, Chip,
  TextField, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Alert, Grid, Switch, FormControlLabel,
  LinearProgress, Divider, Radio, RadioGroup, FormLabel,
  Accordion, AccordionSummary, AccordionDetails, Tooltip,
} from '@mui/material';
import {
  Add, Delete, ExpandMore, Quiz as QuizIcon,
  CheckCircle, Edit,
} from '@mui/icons-material';
import { courseApi, quizApi } from '../../api';

const EMPTY_QUESTION = {
  question_text: '',
  options: ['', '', '', ''],
  correct_index: 0,
  explanation: '',
  topic_tag: '',
};

const EMPTY_QUIZ = {
  course_id: '', lesson_id: null, title: '', description: '',
  time_limit_min: 30, is_published: false,
};

export default function ManageQuizzes() {
  const qc = useQueryClient();
  const [courseId, setCourseId] = useState('');
  const [open,     setOpen]     = useState(false);
  const [form,     setForm]     = useState(EMPTY_QUIZ);
  const [questions, setQuestions] = useState([{ ...EMPTY_QUESTION }]);

  const { data: courses } = useQuery('all-courses', () => courseApi.list().then((r) => r.data.courses));

  const { data: quizData, isLoading } = useQuery(
    ['admin-quizzes', courseId],
    () => quizApi.adminList(courseId ? { course_id: courseId } : {}).then((r) => r.data.quizzes),
    { keepPreviousData: true }
  );

  const createMutation = useMutation(
    (payload) => quizApi.create(payload),
    {
      onSuccess: () => {
        qc.invalidateQueries('admin-quizzes');
        setOpen(false);
        setForm(EMPTY_QUIZ);
        setQuestions([{ ...EMPTY_QUESTION }]);
      },
    }
  );

  const addQuestion = () => setQuestions((q) => [...q, { ...EMPTY_QUESTION }]);

  const removeQuestion = (i) => setQuestions((q) => q.filter((_, idx) => idx !== i));

  const setQ = (i, field, val) =>
    setQuestions((qs) => qs.map((q, idx) => idx === i ? { ...q, [field]: val } : q));

  const setOption = (qi, oi, val) =>
    setQuestions((qs) => qs.map((q, idx) => idx === qi
      ? { ...q, options: q.options.map((o, oidx) => oidx === oi ? val : o) }
      : q));

  const handleSubmit = () => {
    createMutation.mutate({ ...form, questions });
  };

  const validForm = form.title && form.course_id &&
    questions.every((q) => q.question_text && q.options.every((o) => o.trim()));

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Manage Quizzes</Typography>
          <Typography color="text.secondary">Create and manage MCQ assessments</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>
          Create Quiz
        </Button>
      </Stack>

      <FormControl sx={{ minWidth: 280, mb: 3 }}>
        <InputLabel>Filter by Course</InputLabel>
        <Select value={courseId} label="Filter by Course" onChange={(e) => setCourseId(e.target.value)}>
          <MenuItem value="">All Courses</MenuItem>
          {(courses || []).map((c) => <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>)}
        </Select>
      </FormControl>

      {isLoading && <LinearProgress />}

      <Grid container spacing={2}>
        {(quizData || []).map((q) => (
          <Grid item xs={12} sm={6} md={4} key={q.id}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <QuizIcon color="primary" />
                  <Chip
                    label={q.is_published ? 'Published' : 'Draft'}
                    color={q.is_published ? 'success' : 'default'}
                    size="small"
                  />
                </Stack>
                <Typography variant="h6" fontWeight={600} mb={0.5}>{q.title}</Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>{q.course_title}</Typography>
                <Stack direction="row" spacing={1}>
                  <Chip label={`${q.question_count} Qs`}   size="small" variant="outlined" />
                  <Chip label={`${q.attempt_count} attempts`} size="small" variant="outlined" />
                  {q.time_limit_min && <Chip label={`${q.time_limit_min} min`} size="small" variant="outlined" />}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {!isLoading && quizData?.length === 0 && (
          <Grid item xs={12}>
            <Alert severity="info">No quizzes yet. Create one to get started.</Alert>
          </Grid>
        )}
      </Grid>

      {/* Create Quiz Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Quiz</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {/* Quiz metadata */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField label="Quiz Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} fullWidth required />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField label="Time Limit (min)" type="number" value={form.time_limit_min} onChange={(e) => setForm((f) => ({ ...f, time_limit_min: +e.target.value }))} fullWidth />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Course</InputLabel>
                  <Select value={form.course_id} label="Course" onChange={(e) => setForm((f) => ({ ...f, course_id: e.target.value }))}>
                    {(courses || []).map((c) => <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField label="Description (optional)" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} fullWidth multiline rows={2} />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch checked={form.is_published} onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))} />}
                  label="Publish immediately"
                />
              </Grid>
            </Grid>

            <Divider><Typography variant="body2" color="text.secondary">Questions ({questions.length})</Typography></Divider>

            {/* Questions */}
            {questions.map((q, qi) => (
              <Accordion key={qi} defaultExpanded={qi === 0}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%', pr: 2 }}>
                    <Chip label={`Q${qi + 1}`} size="small" color="primary" />
                    <Typography variant="body2" sx={{ flex: 1 }} noWrap>
                      {q.question_text || 'New question...'}
                    </Typography>
                    {q.question_text && q.options.every((o) => o.trim()) && (
                      <CheckCircle color="success" fontSize="small" />
                    )}
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <TextField
                      label="Question text"
                      value={q.question_text}
                      onChange={(e) => setQ(qi, 'question_text', e.target.value)}
                      fullWidth multiline rows={2} required
                    />
                    <Stack direction="row" spacing={2}>
                      <TextField label="Topic tag" value={q.topic_tag} onChange={(e) => setQ(qi, 'topic_tag', e.target.value)} sx={{ flex: 1 }} placeholder="e.g. Algebra, Geometry" />
                    </Stack>
                    <FormLabel>Options — select the correct answer</FormLabel>
                    <RadioGroup
                      value={q.correct_index}
                      onChange={(e) => setQ(qi, 'correct_index', +e.target.value)}
                    >
                      {q.options.map((opt, oi) => (
                        <Stack key={oi} direction="row" alignItems="center" spacing={1} mb={1}>
                          <Radio value={oi} />
                          <TextField
                            size="small"
                            placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                            value={opt}
                            onChange={(e) => setOption(qi, oi, e.target.value)}
                            sx={{ flex: 1 }}
                            required
                          />
                        </Stack>
                      ))}
                    </RadioGroup>
                    <TextField
                      label="Explanation (shown after submission)"
                      value={q.explanation}
                      onChange={(e) => setQ(qi, 'explanation', e.target.value)}
                      fullWidth multiline rows={2}
                    />
                    {questions.length > 1 && (
                      <Button
                        color="error" size="small" startIcon={<Delete />}
                        onClick={() => removeQuestion(qi)}
                        sx={{ alignSelf: 'flex-start' }}
                      >
                        Remove Question
                      </Button>
                    )}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ))}

            <Button variant="outlined" startIcon={<Add />} onClick={addQuestion}>
              Add Question
            </Button>

            {createMutation.isError && (
              <Alert severity="error">Failed to create quiz. Check all fields.</Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!validForm || createMutation.isLoading}
          >
            {createMutation.isLoading ? 'Creating...' : `Create Quiz (${questions.length} questions)`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
