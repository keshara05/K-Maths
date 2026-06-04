import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import {
  Box, Card, CardContent, Typography, Button, Radio, RadioGroup,
  FormControlLabel, LinearProgress, Chip, Alert, CircularProgress,
  Grid, Avatar, Fade,
} from '@mui/material';
import { Timer, CheckCircle, Cancel, EmojiEvents, ArrowBack } from '@mui/icons-material';
import { quizApi } from '../../api';

// ── Timer component ───────────────────────────────────────────────────────────
const QuizTimer = ({ seconds, onExpire }) => {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    if (!seconds) return;
    const t = setInterval(() => setRemaining((r) => { if (r <= 1) { clearInterval(t); onExpire(); return 0; } return r - 1; }), 1000);
    return () => clearInterval(t);
  }, [seconds, onExpire]);
  const pct = seconds ? (remaining / seconds) * 100 : 100;
  const m = Math.floor(remaining / 60), s = remaining % 60;
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <Timer fontSize="small" sx={{ color: pct < 25 ? 'error.main' : 'text.secondary' }} />
        <Typography variant="body2" fontWeight={600} color={pct < 25 ? 'error.main' : 'text.primary'}>
          {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
        </Typography>
      </Box>
      <LinearProgress variant="determinate" value={pct} color={pct < 25 ? 'error' : pct < 50 ? 'warning' : 'primary'} sx={{ height: 6, borderRadius: 3 }} />
    </Box>
  );
};

// ── Results view ──────────────────────────────────────────────────────────────
const QuizResults = ({ score, total, percentage, results, onRetry }) => (
  <Card>
    <CardContent sx={{ textAlign: 'center', py: 4 }}>
      <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: percentage >= 70 ? 'success.light' : percentage >= 40 ? 'warning.light' : 'error.light' }}>
        <EmojiEvents sx={{ fontSize: 40, color: percentage >= 70 ? 'success.dark' : percentage >= 40 ? 'warning.dark' : 'error.dark' }} />
      </Avatar>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {percentage >= 70 ? 'Well done! 🎉' : percentage >= 40 ? 'Good effort! 💪' : 'Keep practising! 📚'}
      </Typography>
      <Typography variant="h2" fontWeight={800} color={percentage >= 70 ? 'success.main' : percentage >= 40 ? 'warning.main' : 'error.main'} sx={{ my: 1 }}>
        {percentage}%
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        {score} out of {total} correct
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2, textAlign: 'left' }}>Answer Review</Typography>
        {results.map((r, i) => (
          <Card key={r.question_id} variant="outlined" sx={{ mb: 1.5, borderColor: r.is_correct ? 'success.main' : 'error.main', borderWidth: 1.5 }}>
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                {r.is_correct ? <CheckCircle sx={{ color: 'success.main', mt: 0.25 }} /> : <Cancel sx={{ color: 'error.main', mt: 0.25 }} />}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={500}>Q{i + 1}</Typography>
                  {r.explanation && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      💡 {r.explanation}
                    </Typography>
                  )}
                  {r.topic_tag && <Chip label={r.topic_tag} size="small" sx={{ mt: 0.5, fontSize: 10 }} />}
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
      <Button variant="contained" sx={{ mt: 2 }} onClick={onRetry}>Back to Dashboard</Button>
    </CardContent>
  </Card>
);

// ── Main quiz page ────────────────────────────────────────────────────────────
export default function QuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  const { data, isLoading, error } = useQuery(['quiz', quizId], () => quizApi.get(quizId).then((r) => r.data));
  const quiz = data?.quiz;
  const questions = data?.questions || [];

  const { mutate: submit, isLoading: submitting } = useMutation(
    () => quizApi.submit(quizId, answers),
    {
      onSuccess: ({ data: res }) => {
        setResult(res);
        setSubmitted(true);
      },
    }
  );

  const handleAnswer = (questionId, value) =>
    setAnswers((a) => ({ ...a, [questionId]: parseInt(value) }));

  const handleExpire = useCallback(() => submit(), [submit]);

  const progress = questions.length ? ((current + 1) / questions.length) * 100 : 0;
  const currentQ = questions[current];
  const answeredAll = questions.every((q) => answers[q.id] !== undefined);

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Quiz not found</Alert>;
  if (submitted && result) return <QuizResults {...result} onRetry={() => navigate('/dashboard')} />;

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Button startIcon={<ArrowBack />} size="small" onClick={() => navigate(-1)}>Back</Button>
        <Typography variant="h5" fontWeight={700} sx={{ flex: 1 }}>{quiz?.title}</Typography>
        <Chip label={`${Object.keys(answers).length}/${questions.length} answered`} size="small" color="primary" />
      </Box>

      {/* Timer */}
      {quiz?.time_limit_min && !submitted && (
        <QuizTimer seconds={quiz.time_limit_min * 60} onExpire={handleExpire} />
      )}

      {/* Progress bar */}
      <LinearProgress variant="determinate" value={progress} sx={{ mb: 2, height: 4, borderRadius: 2 }} />

      {/* Question */}
      {currentQ && (
        <Fade key={currentQ.id} in timeout={300}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2.5 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: 14 }}>{current + 1}</Avatar>
                <Typography variant="h6" sx={{ flex: 1, lineHeight: 1.5 }}>{currentQ.question_text}</Typography>
              </Box>
              <RadioGroup value={answers[currentQ.id] ?? ''} onChange={(e) => handleAnswer(currentQ.id, e.target.value)}>
                <Grid container spacing={1}>
                  {(currentQ.options || []).map((opt, i) => (
                    <Grid item xs={12} sm={6} key={i}>
                      <Card variant="outlined" sx={{
                        cursor: 'pointer', transition: 'all .15s',
                        borderColor: answers[currentQ.id] === i ? 'primary.main' : 'divider',
                        bgcolor: answers[currentQ.id] === i ? 'primary.50' : 'transparent',
                        '&:hover': { borderColor: 'primary.light', bgcolor: 'action.hover' },
                      }} onClick={() => handleAnswer(currentQ.id, i)}>
                        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 }, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Radio value={i} size="small" sx={{ p: 0 }} checked={answers[currentQ.id] === i} />
                          <Typography variant="body2">{opt}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </RadioGroup>
            </CardContent>
          </Card>
        </Fade>
      )}

      {/* Navigation */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
        <Button variant="outlined" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>Previous</Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {current < questions.length - 1 ? (
            <Button variant="contained" onClick={() => setCurrent((c) => c + 1)}>Next</Button>
          ) : (
            <Button
              variant="contained" color="success"
              disabled={!answeredAll || submitting}
              onClick={() => submit()}
              startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {submitting ? 'Submitting…' : 'Submit Quiz'}
            </Button>
          )}
        </Box>
      </Box>

      {/* Question nav dots */}
      <Box sx={{ display: 'flex', gap: 0.5, mt: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        {questions.map((q, i) => (
          <Box key={q.id} onClick={() => setCurrent(i)} sx={{
            width: 28, height: 28, borderRadius: '50%', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 600,
            bgcolor: i === current ? 'primary.main' : answers[q.id] !== undefined ? 'success.light' : 'action.hover',
            color: i === current ? '#fff' : answers[q.id] !== undefined ? 'success.dark' : 'text.secondary',
            border: '2px solid', borderColor: i === current ? 'primary.main' : 'transparent',
            transition: 'all .15s',
          }}>{i + 1}</Box>
        ))}
      </Box>
    </Box>
  );
}
