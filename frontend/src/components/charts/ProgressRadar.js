import React from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, Legend,
} from 'recharts';
import { Box, Typography } from '@mui/material';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
      borderRadius: 2, p: 1.5, boxShadow: 2 }}>
      <Typography variant="subtitle2" fontWeight={700}>{d.topic}</Typography>
      <Typography variant="body2" color="success.main">Accuracy: {d.accuracy}%</Typography>
      <Typography variant="caption" color="text.secondary">
        {d.correct} / {d.total} correct
      </Typography>
    </Box>
  );
};

export default function ProgressRadar({ data = [], height = 300 }) {
  if (!data.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary" variant="body2">
          Complete some quizzes to see your topic radar
        </Typography>
      </Box>
    );
  }

  const chartData = data.map(d => ({
    topic: d.topic.length > 12 ? d.topic.slice(0, 12) + '…' : d.topic,
    fullTopic: d.topic,
    accuracy: d.accuracy,
    correct: d.correct,
    total: d.total,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={chartData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="#e0e0e0" />
        <PolarAngleAxis
          dataKey="topic"
          tick={{ fontSize: 11, fill: '#546E7A', fontWeight: 500 }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 100]}
          tick={{ fontSize: 10, fill: '#90A4AE' }}
          tickCount={5}
          tickFormatter={v => `${v}%`}
        />
        <Radar
          name="Accuracy"
          dataKey="accuracy"
          stroke="#1565C0"
          fill="#1565C0"
          fillOpacity={0.25}
          strokeWidth={2}
          dot={{ r: 4, fill: '#1565C0' }}
        />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
