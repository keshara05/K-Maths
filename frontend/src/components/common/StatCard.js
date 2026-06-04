import React from 'react';
import { Card, CardContent, Box, Typography, Skeleton } from '@mui/material';

const StatCard = ({ title, value, subtitle, icon, color = 'primary.main', loading }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {title}
          </Typography>
          {loading ? (
            <Skeleton variant="text" width={80} height={40} />
          ) : (
            <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5, color }}>
              {value}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {icon && (
          <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: `${color}18`, color, display: 'flex' }}>
            {icon}
          </Box>
        )}
      </Box>
    </CardContent>
  </Card>
);

export default StatCard;
