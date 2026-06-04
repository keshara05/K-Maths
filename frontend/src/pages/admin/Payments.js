import React, { useState } from 'react';
import { useQuery } from 'react-query';
import {
  Box, Typography, Card, CardContent, Stack, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, InputAdornment, Select, MenuItem, FormControl, InputLabel,
  LinearProgress, Pagination, Grid, Avatar,
} from '@mui/material';
import {
  Search, AttachMoney, CheckCircle, HourglassEmpty, Cancel,
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';
import { paymentApi } from '../../api';

const STATUS_CONFIG = {
  paid:    { color: 'success', icon: <CheckCircle fontSize="small" /> },
  pending: { color: 'warning', icon: <HourglassEmpty fontSize="small" /> },
  failed:  { color: 'error',   icon: <Cancel fontSize="small" /> },
  refunded:{ color: 'default', icon: <Cancel fontSize="small" /> },
};

export default function AdminPayments() {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page,   setPage]   = useState(1);

  const { data, isLoading } = useQuery(
    ['admin-payments', status, page],
    () => paymentApi.adminAll({ status, page, limit: 15 }).then((r) => r.data),
    { keepPreviousData: true }
  );

  const { data: summary } = useQuery('revenue-summary',
    () => paymentApi.summary().then((r) => r.data.summary));

  const revenueChart = (summary || []).slice(0, 6).reverse().map((r) => ({
    month: dayjs(r.month).format('MMM YYYY'),
    revenue: parseFloat(r.total_revenue),
  }));

  const totalRevenue = (summary || []).reduce((a, r) => a + parseFloat(r.total_revenue), 0);
  const thisMonth    = summary?.[0]?.total_revenue || 0;
  const paidCount    = (summary || []).reduce((a, r) => a + parseInt(r.paid_count), 0);

  const filtered = (data?.payments || []).filter((p) =>
    !search ||
    p.student_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={0.5}>Payments</Typography>
      <Typography color="text.secondary" mb={3}>Track fees, revenue, and payment status</Typography>

      {/* KPI row */}
      <Grid container spacing={2} mb={3}>
        {[
          { label: 'Total Revenue',  value: `LKR ${Number(totalRevenue).toLocaleString()}`, color: 'success' },
          { label: 'This Month',     value: `LKR ${Number(thisMonth).toLocaleString()}`,    color: 'primary' },
          { label: 'Payments Made',  value: paidCount,                                       color: 'info' },
        ].map((k) => (
          <Grid item xs={12} sm={4} key={k.label}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: `${k.color}.light`, color: `${k.color}.dark` }}>
                  <AttachMoney />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">{k.label}</Typography>
                  <Typography variant="h5" fontWeight={700}>{k.value}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Revenue chart */}
      {revenueChart.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2}>Monthly Revenue</Typography>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueChart} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => `LKR ${v.toLocaleString()}`} />
                <Bar dataKey="revenue" fill="#2E7D32" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
        <TextField
          placeholder="Search student..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
          sx={{ flex: 1 }}
        />
        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select value={status} label="Status" onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <MenuItem value="">All</MenuItem>
            {['paid', 'pending', 'failed', 'refunded'].map((s) => (
              <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {isLoading && <LinearProgress />}

      <TableContainer component={Card}>
        <Table>
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'grey.50' } }}>
              <TableCell>Student</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Month</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Paid At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>{p.student_name}</Typography>
                  <Typography variant="caption" color="text.secondary">{p.email}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>{p.course_title}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{dayjs(p.month_year).format('MMMM YYYY')}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    LKR {Number(p.amount).toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={STATUS_CONFIG[p.status]?.icon}
                    label={p.status}
                    color={STATUS_CONFIG[p.status]?.color}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="caption">
                    {p.paid_at ? dayjs(p.paid_at).format('MMM D, YYYY') : '—'}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No payments found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {(data?.total || 0) > 15 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={Math.ceil(data.total / 15)}
            page={page}
            onChange={(_, v) => setPage(v)}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
}
