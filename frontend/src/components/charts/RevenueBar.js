import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { Box, Typography } from '@mui/material';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
      borderRadius: 2, p: 1.5, boxShadow: 2 }}>
      <Typography variant="subtitle2" fontWeight={700}>{label}</Typography>
      <Typography variant="body2" color="primary.main">
        LKR {Number(payload[0].value).toLocaleString()}
      </Typography>
    </Box>
  );
};

export default function RevenueBar({ data = [], height = 240 }) {
  if (!data.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary" variant="body2">No revenue data available</Typography>
      </Box>
    );
  }

  const maxVal = Math.max(...data.map(d => d.revenue || 0));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#546E7A' }} />
        <YAxis
          tick={{ fontSize: 11, fill: '#90A4AE' }}
          tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(21,101,192,0.08)' }} />
        <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={48}>
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={entry.revenue === maxVal ? '#F57C00' : '#1565C0'}
              fillOpacity={entry.revenue === maxVal ? 1 : 0.7}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
