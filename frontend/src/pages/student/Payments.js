import React from 'react';
import { useQuery } from 'react-query';
import {
  Box, Card, CardContent, Typography, Chip, Grid,
  Table, TableBody, TableCell, TableHead, TableRow, Skeleton, Alert,
} from '@mui/material';
import { Payment, CheckCircle, Pending, Error } from '@mui/icons-material';
import StatCard from '../../components/common/StatCard';
import { paymentApi } from '../../api';

const STATUS_COLOR = { paid: 'success', pending: 'warning', failed: 'error', refunded: 'info' };
const STATUS_ICON  = { paid: <CheckCircle fontSize="small" />, pending: <Pending fontSize="small" />, failed: <Error fontSize="small" /> };

export default function Payments() {
  const { data, isLoading, error } = useQuery('payment-history', () => paymentApi.history().then((r) => r.data));
  const payments = data?.payments || [];

  const totalPaid = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0);
  const pending   = payments.filter((p) => p.status === 'pending').length;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>Payments</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Track your fee payments and receipts</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>Failed to load payments</Alert>}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <StatCard title="Total Paid" value={`LKR ${totalPaid.toLocaleString()}`} icon={<Payment />} color="success.main" loading={isLoading} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard title="Pending Payments" value={pending} icon={<Pending />} color="warning.main" loading={isLoading} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard title="Total Transactions" value={payments.length} icon={<Payment />} color="primary.main" loading={isLoading} />
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Payment History</Typography>
          {isLoading ? (
            [1,2,3].map((k) => <Skeleton key={k} variant="rectangular" height={48} sx={{ mb: 1 }} />)
          ) : payments.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Payment sx={{ fontSize: 64, color: 'text.disabled' }} />
              <Typography color="text.secondary" sx={{ mt: 1 }}>No payment records yet</Typography>
            </Box>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Course</strong></TableCell>
                    <TableCell><strong>Month</strong></TableCell>
                    <TableCell><strong>Amount</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell>{p.course_title}</TableCell>
                      <TableCell>{new Date(p.month_year).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</TableCell>
                      <TableCell><strong>LKR {Number(p.amount).toLocaleString()}</strong></TableCell>
                      <TableCell>
                        <Chip
                          icon={STATUS_ICON[p.status]}
                          label={p.status}
                          size="small"
                          color={STATUS_COLOR[p.status] || 'default'}
                        />
                      </TableCell>
                      <TableCell>{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
