import React, { useState } from 'react';
import { useQuery } from 'react-query';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip,
  ToggleButton, ToggleButtonGroup, TextField, InputAdornment, Skeleton,
} from '@mui/material';
import { Search, PictureAsPdf, Download, LibraryBooks } from '@mui/icons-material';
import { resourceApi } from '../../api';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';

export default function Resources() {
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const { t, language } = useThemeLanguage();

  const TYPE_LABELS = {
    notes: t('resources_notes'),
    past_paper: t('resources_past'),
    model_paper: t('resources_model'),
    tutorial: t('resources_tutorials')
  };

  const TYPE_COLORS = { notes: 'primary', past_paper: 'secondary', model_paper: 'success', tutorial: 'info' };

  const { data, isLoading } = useQuery(['resources', type], () => resourceApi.list(type ? { type } : {}).then((r) => r.data));
  const resources = (data?.resources || []).filter((r) => r.title.toLowerCase().includes(search.toLowerCase()));

  const handleDownload = async (resource) => {
    try {
      const { data: res } = await resourceApi.download(resource.id);
      window.open(res.url, '_blank');
    } catch {
      alert(language === 'en' ? 'Could not download file. Please try again.' : 'ගොනුව බාගත කිරීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න.');
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>{t('resources_title')}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{t('resources_subtitle')}</Typography>
 
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <ToggleButtonGroup size="small" value={type} exclusive onChange={(_, v) => setType(v || '')}>
          <ToggleButton value="">{t('resources_all')}</ToggleButton>
          <ToggleButton value="notes">Notes</ToggleButton>
          <ToggleButton value="past_paper">Past Papers</ToggleButton>
          <ToggleButton value="model_paper">Model Papers</ToggleButton>
          <ToggleButton value="tutorial">Tutorials</ToggleButton>
        </ToggleButtonGroup>
        <TextField size="small" placeholder={t('resources_search')} value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} />
      </Box>

      <Grid container spacing={2}>
        {isLoading ? [1,2,3,4].map((k) => <Grid item xs={12} sm={6} md={4} key={k}><Skeleton variant="rounded" height={140} /></Grid>)
        : resources.length === 0 ? (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <LibraryBooks sx={{ fontSize: 64, color: 'text.disabled' }} />
              <Typography color="text.secondary" sx={{ mt: 1 }}>{t('resources_empty')}</Typography>
            </Box>
          </Grid>
        ) : resources.map((r) => (
          <Grid item xs={12} sm={6} md={4} key={r.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                  <Chip label={TYPE_LABELS[r.type] || r.type} size="small" color={TYPE_COLORS[r.type] || 'default'} />
                  {r.year && <Chip label={r.year} size="small" variant="outlined" />}
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  <PictureAsPdf sx={{ color: 'error.main', mt: 0.25 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>{r.title}</Typography>
                    {r.description && <Typography variant="caption" color="text.secondary">{r.description}</Typography>}
                    {r.course_title && <Typography variant="caption" color="text.secondary" display="block">📚 {r.course_title}</Typography>}
                    {r.file_size && <Typography variant="caption" color="text.secondary">{(r.file_size / 1024).toFixed(0)} KB</Typography>}
                  </Box>
                </Box>
              </CardContent>
              <Box sx={{ px: 2, pb: 2 }}>
                <Button fullWidth variant="outlined" size="small" startIcon={<Download />} onClick={() => handleDownload(r)}>
                  {language === 'en' ? 'Download' : 'බාගත කරන්න'}
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
