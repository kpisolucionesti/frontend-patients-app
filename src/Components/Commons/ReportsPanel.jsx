import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, IconButton, List, ListItem, ListItemText,
  ListItemIcon, CircularProgress, Alert, Chip
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import { BackendAPI } from '../../services/BackendApi';
import moment from 'moment';

const REPORT_TYPE_LABELS = {
  triage: 'Informe de Triaje',
  resident: 'Informe del Residente',
  specialist: 'Informe del Especialista',
  admission: 'Informe de Ingreso',
  progress: 'Informe Evolutivo',
  interconsultation: 'Informe de Interconsulta',
  discharge: 'Informe de Alta Médica',
};

export default function ReportsPanel({ attachableType, attachableId }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadReports = useCallback(async () => {
    if (!attachableId) return;
    setLoading(true);
    try {
      const data = await BackendAPI.documents.list(attachableType, attachableId);
      setReports((data || []).filter(d => d.report_type));
    } catch {
      setError('Error al cargar informes');
    } finally {
      setLoading(false);
    }
  }, [attachableType, attachableId]);

  useEffect(() => { loadReports(); }, [loadReports]);

  const handleDownload = (doc) => {
    if (doc.file_url) {
      window.open(doc.file_url, '_blank');
    }
  };

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
      {loading ? (
        <CircularProgress size={24} sx={{ display: 'block', mx: 'auto', mt: 2 }} />
      ) : (
        <List dense>
          {reports.map(doc => (
            <ListItem key={doc.id}>
              <ListItemIcon>
                <PictureAsPdfIcon color="error" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                      {REPORT_TYPE_LABELS[doc.report_type] || doc.description || 'Informe'}
                    </Typography>
                    <Chip
                      label={doc.report_type}
                      size="small"
                      variant="outlined"
                      sx={{ height: 16, '& .MuiChip-label': { fontSize: '0.55rem', px: 0.3 } }}
                    />
                  </Box>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {doc.created_at ? moment(doc.created_at).format('DD/MM/YYYY HH:mm') : ''}
                    {doc.file_size ? ` — ${doc.file_size}` : ''}
                    {doc.uploaded_by?.name ? ` — por ${doc.uploaded_by.name}` : ''}
                  </Typography>
                }
              />
              <IconButton edge="end" onClick={() => handleDownload(doc)} size="small" color="primary">
                <DownloadIcon />
              </IconButton>
            </ListItem>
          ))}
          {reports.length === 0 && !loading && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              No hay informes generados
            </Typography>
          )}
        </List>
      )}
    </Box>
  );
}
