import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Button, LinearProgress, Chip, Alert,
  Radio, RadioGroup, FormControlLabel, FormControl, Divider, Collapse,
} from '@mui/material';
import {
  Timer, CheckCircle, Cancel, NavigateNext, NavigateBefore, Flag, EmojiEvents,
} from '@mui/icons-material';

// ── Timer display ─────────────────────────────────────────────────────────────
function TimerDisplay({ seconds }) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const urgent = seconds < 60;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: urgent ? 'error.main' : 'text.secondary' }}>
      <Timer fontSize="small" />
      <Typography variant="body2" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}>
        {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
      </Typography>
    </Box>
  );
}

// ── Results screen ────────────────────────────────────────────────────────────
function ResultsScreen({ result, questions, onRetry }) {
  const { score, total, percentage, results } = result;
  const grade = percentage >= 75 ? 'Excellent' : percentage >= 50 ? 'Good' : 'Needs Practice';
  const gradeColor = percentage >= 75 ? 'success' : percentage >= 50 ? 'warning' : 'error';

  return (
    <Box>
      {/* Score summary */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #1565C0 0%, #1E88E5 100%)', color: '#fff' }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <EmojiEvents sx={{ fontSize: 56, mb: 1, opacity: 0.9 }} />
          <Typography variant="h3" fontWeight={800}>{percentage}%</Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>{grade}</Typography>
          <Typography variant="body2" sx={{ opacity: 0.75 }}>
            {score} correct out of {total} questions
          </Typography>
          <Box sx={{ mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={percentage}
              sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.3)',
                '& .MuiLinearProgress-bar': { bgcolor: '#fff', borderRadius: 4 } }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Per-question review */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Question Review</Typography>
      {results.map((r, i) => {
        const q = questions.find(q => q.id === r.question_id);
        if (!q) return null;
        return (
          <Card key={r.question_id} sx={{
            mb: 2,
            border: '1px solid',
            borderColor: r.is_correct ? 'success.light' : 'error.light',
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 1.5 }}>
                {r.is_correct
                  ? <CheckCircle color="success" sx={{ mt: 0.25, flexShrink: 0 }} />
                  : <Cancel color="error" sx={{ mt: 0.25, flexShrink: 0 }} />
                }
                <Typography variant="body1" fontWeight={600}>
                  Q{i + 1}. {q.question_text}
                </Typography>
              </Box>

              <Box sx={{ pl: 4 }}>
                {q.options.map((opt, idx) => {
                  const isChosen  = r.chosen_index === idx;
                  const isCorrect = r.correct_index === idx;
                  const bg = isCorrect ? 'success.50' : isChosen && !isCorrect ? 'error.50' : 'transparent';
                  const color = isCorrect ? 'success.dark' : isChosen ? 'error.dark' : 'text.primary';
                  return (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5,
                      px: 1, borderRadius: 1, bgcolor: bg, mb: 0.5 }}>
                      <Typography variant="body2" sx={{ color, fontWeight: (isCorrect || isChosen) ? 600 : 400 }}>
                        {String.fromCharCode(65 + idx)}. {opt}
                        {isCorrect && ' ✓'}
                        {isChosen && !isCorrect && ' ✗'}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>

              {r.explanation && (
                <Box sx={{ mt: 1.5, pl: 4, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Explanation: </Typography>
                  <Typography variant="caption" color="text.secondary">{r.explanation}</Typography>
                </Box>
              )}

              {q.topic_tag && (
                <Box sx={{ mt: 1, pl: 4 }}>
                  <Chip label={q.topic_tag} size="small" variant="outlined" color="primary" />
                </Box>
              )}
            </CardContent>
          </Card>
        );
      })}

      <Button variant="outlined" onClick={onRetry} fullWidth sx={{ mt: 1 }}>
        Back to Dashboard
      </Button>
    </Box>
  );
}

// ── Main QuizRunner ───────────────────────────────────────────────────────────
export default function QuizRunner({ quiz, questions, onSubmit, submitting, result }) {
  const [current, setCurrent]   = useState(0);
  const [answers, setAnswers]   = useState({});
  const [flagged, setFlagged]   = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(
    quiz.time_limit_min ? quiz.time_limit_min * 60 : null
  );
  const [submitted, setSubmitted] = useState(false);

  // Timer
  useEffect(() => {
    if (!timeLeft || submitted) return;
    if (timeLeft === 0) { handleSubmit(); return; }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, submitted]);

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    onSubmit(answers);
  }, [answers, onSubmit]);

  const q = questions[current];
  const answered  = Object.keys(answers).length;
  const progress  = (answered / questions.length) * 100;

  if (result) {
    return <ResultsScreen result={result} questions={questions} onRetry={() => window.history.back()} />;
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>{quiz.title}</Typography>
          <Typography variant="body2" color="text.secondary">
            Question {current + 1} of {questions.length} · {answered} answered
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {timeLeft !== null && <TimerDisplay seconds={timeLeft} />}
          <Button variant="contained" color="success" onClick={handleSubmit}
            disabled={submitting} size="small">
            {submitting ? 'Submitting…' : 'Submit Quiz'}
          </Button>
        </Box>
      </Box>

      {/* Progress bar */}
      <LinearProgress variant="determinate" value={progress} sx={{ mb: 2, height: 6, borderRadius: 3 }} />

      {/* Question dots navigation */}
      <Box sx={{ display: 'flex', gap: 0.75, mb: 3, flexWrap: 'wrap' }}>
        {questions.map((_, i) => (
          <Box key={i} onClick={() => setCurrent(i)}
            sx={{
              width: 32, height: 32, borderRadius: 1, display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', fontSize: 12, fontWeight: 600,
              border: '1px solid',
              bgcolor: i === current ? 'primary.main'
                : answers[questions[i].id] !== undefined ? 'success.light'
                : 'background.paper',
              borderColor: i === current ? 'primary.main'
                : answers[questions[i].id] !== undefined ? 'success.main'
                : 'divider',
              color: i === current ? '#fff'
                : answers[questions[i].id] !== undefined ? 'success.dark'
                : 'text.secondary',
              transition: 'all 0.15s',
            }}>
            {flagged.has(i) ? <Flag sx={{ fontSize: 14 }} /> : i + 1}
          </Box>
        ))}
      </Box>

      {/* Question card */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              {q.topic_tag && <Chip label={q.topic_tag} size="small" color="primary" variant="outlined" sx={{ mb: 1 }} />}
              <Typography variant="body1" fontWeight={600} sx={{ lineHeight: 1.6 }}>
                {current + 1}. {q.question_text}
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setFlagged(f => {
              const next = new Set(f);
              next.has(current) ? next.delete(current) : next.add(current);
              return next;
            })} sx={{ ml: 1 }}>
              <Flag fontSize="small" color={flagged.has(current) ? 'warning' : 'disabled'} />
            </IconButton>
          </Box>

          <FormControl component="fieldset" fullWidth>
            <RadioGroup value={answers[q.id] !== undefined ? String(answers[q.id]) : ''}
              onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: Number(e.target.value) }))}>
              {q.options.map((opt, idx) => (
                <FormControlLabel
                  key={idx}
                  value={String(idx)}
                  control={<Radio color="primary" />}
                  label={<Typography variant="body2">{String.fromCharCode(65 + idx)}. {opt}</Typography>}
                  sx={{
                    mx: 0, px: 1.5, py: 0.75, borderRadius: 1, mb: 0.5,
                    border: '1px solid',
                    borderColor: answers[q.id] === idx ? 'primary.main' : 'divider',
                    bgcolor: answers[q.id] === idx ? 'primary.50' : 'transparent',
                    transition: 'all 0.15s',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button startIcon={<NavigateBefore />} disabled={current === 0}
          onClick={() => setCurrent(c => c - 1)} variant="outlined">
          Previous
        </Button>
        {current < questions.length - 1 ? (
          <Button endIcon={<NavigateNext />} onClick={() => setCurrent(c => c + 1)} variant="contained">
            Next
          </Button>
        ) : (
          <Button variant="contained" color="success" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Finish & Submit'}
          </Button>
        )}
      </Box>
    </Box>
  );
}
