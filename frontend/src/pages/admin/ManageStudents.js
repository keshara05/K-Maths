import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box, Card, CardContent, Typography, TextField, InputAdornment,
  Table, TableHead, TableRow, TableCell, TableBody, Chip, IconButton,
  Avatar, Tooltip, Select, MenuItem, FormControl, InputLabel, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, Skeleton, Alert, Pagination,
} from '@mui/material';
import { Search, Block, CheckCircle, People } from '@mui/icons-material';
import { adminApi } from '../../api';

export default function ManageStudents() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('student');
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState(null);
  const [msg, setMsg] = useState(null);

  const { data, isLoading } = useQuery(
    ['admin-users', search, role, page],
    () => adminApi.users({ search, role, page, limit: 15 }).then((r) => r.data),
    { keepPreviousData: true }
  );
  const users = data?.users || [];
  const total = data?.total || 0;

  const { mutate: toggleActive } = useMutation(
    ({ id, is_active }) => adminApi.updateUser(id, { is_active }),
    {
      onSuccess: (_, vars) => {
        qc.invalidateQueries('admin-users');
        setMsg({ type: 'success', text: `User ${vars.is_active ? 'activated' : 'deactivated'}` });
        setConfirm(null);
      },
    }
  );

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>Students & Users</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Manage all platform users</Typography>

      {msg && <Alert severity={msg.type} sx={{ mb: 2 }} onClose={() => setMsg(null)}>{msg.text}</Alert>}

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 2.5, flexWrap: 'wrap' }}>
            <TextField
              size="small" placeholder="Search by name or email…" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
              sx={{ flex: 1, minWidth: 200 }}
            />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Role</InputLabel>
              <Select value={role} label="Role" onChange={(e) => { setRole(e.target.value); setPage(1); }}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="student">Students</MenuItem>
                <MenuItem value="teacher">Teachers</MenuItem>
                <MenuItem value="admin">Admins</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Student</strong></TableCell>
                  <TableCell><strong>Grade</strong></TableCell>
                  <TableCell><strong>School</strong></TableCell>
                  <TableCell><strong>Role</strong></TableCell>
                  <TableCell><strong>Joined</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  [1,2,3,4,5].map((k) => (
                    <TableRow key={k}>
                      {[1,2,3,4,5,6,7].map((j) => <TableCell key={j}><Skeleton /></TableCell>)}
                    </TableRow>
                  ))
                ) : users.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 30, height: 30, fontSize: 13, bgcolor: 'primary.light' }}>{u.full_name?.charAt(0)}</Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>{u.full_name}</Typography>
                          <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{u.grade ? `Grade ${u.grade}` : '—'}</TableCell>
                    <TableCell><Typography variant="caption" noWrap sx={{ maxWidth: 120, display: 'block' }}>{u.school || '—'}</Typography></TableCell>
                    <TableCell><Chip label={u.role} size="small" color={u.role === 'admin' ? 'error' : u.role === 'teacher' ? 'warning' : 'primary'} /></TableCell>
                    <TableCell><Typography variant="caption">{new Date(u.created_at).toLocaleDateString()}</Typography></TableCell>
                    <TableCell>
                      <Chip label={u.is_active ? 'Active' : 'Inactive'} size="small" color={u.is_active ? 'success' : 'default'} />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title={u.is_active ? 'Deactivate' : 'Activate'}>
                        <IconButton size="small" onClick={() => setConfirm(u)} color={u.is_active ? 'error' : 'success'}>
                          {u.is_active ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          {total > 15 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination count={Math.ceil(total / 15)} page={page} onChange={(_, v) => setPage(v)} color="primary" size="small" />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Confirm toggle dialog */}
      <Dialog open={!!confirm} onClose={() => setConfirm(null)} maxWidth="xs">
        <DialogTitle>{confirm?.is_active ? 'Deactivate' : 'Activate'} User</DialogTitle>
        <DialogContent>
          <Typography>
            {confirm?.is_active ? 'This will prevent the student from logging in.' : 'This will restore access for the student.'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{confirm?.full_name} ({confirm?.email})</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(null)}>Cancel</Button>
          <Button variant="contained" color={confirm?.is_active ? 'error' : 'success'}
            onClick={() => toggleActive({ id: confirm.id, is_active: !confirm.is_active })}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
