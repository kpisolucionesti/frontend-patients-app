import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, IconButton, List, ListItem, ListItemText,
  ListItemIcon, ListItemSecondaryAction, Chip, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Divider, Button
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import FileUploader from './FileUploader';
import usePermissions from '../../hooks/usePermissions';
import { BackendAPI } from '../../services/BackendApi';
import moment from 'moment';

export default function DocumentsPanel({ attachableType, attachableId, managePermission, emergencyId, patientId }) {
  const permissions = usePermissions();
  const canManage = !managePermission || permissions.includes(managePermission);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const loadDocuments = useCallback(async () => {
    if (!attachableId) return;
    setLoading(true);
    try {
      const data = await BackendAPI.documents.list(attachableType, attachableId);
      setDocuments(data);
    } catch {
      setError('Error al cargar documentos');
    } finally {
      setLoading(false);
    }
  }, [attachableType, attachableId]);

  useEffect(() => { loadDocuments(); }, [loadDocuments]);

  const handleFileSelect = async (file) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('attachable_type', attachableType);
      fd.append('attachable_id', attachableId);
      fd.append('file_type', file.type);
      await BackendAPI.documents.create(fd);
      await loadDocuments();
    } catch {
      setError('Error al subir archivo');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await BackendAPI.documents.destroy(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch {
      setError('Error al eliminar archivo');
    }
  };

  const handleDownload = (doc) => {
    if (doc.file_url) {
      window.open(doc.file_url, '_blank');
    }
  };

  const getIcon = (fileType) => {
    if (!fileType) return <AttachFileIcon />;
    if (fileType.startsWith('image/')) return <ImageIcon />;
    if (fileType.includes('pdf')) return <PictureAsPdfIcon />;
    return <DescriptionIcon />;
  };

  const userUploads = documents.filter(d => !d.report_type);
  const systemReports = documents.filter(d => d.report_type);

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>Documentos Adjuntos</Typography>
      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
      {canManage && <FileUploader onFileSelect={handleFileSelect} disabled={uploading} />}
      {canManage && uploading && <CircularProgress size={24} sx={{ display: 'block', mx: 'auto', mt: 1 }} />}
      {loading ? (
        <CircularProgress size={24} sx={{ display: 'block', mx: 'auto', mt: 2 }} />
      ) : (
        <List dense>
          {userUploads.map(doc => (
            <ListItem key={doc.id}>
              <ListItemIcon>{getIcon(doc.file_type)}</ListItemIcon>
              <ListItemText
                primary={doc.file_name || 'Archivo'}
                secondary={doc.description || doc.file_type}
              />
              <Chip label={doc.file_size || ''} size="small" sx={{ mr: 1 }} />
              {canManage && (
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => handleDelete(doc.id)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              )}
            </ListItem>
          ))}
          {userUploads.length === 0 && !loading && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              No hay documentos adjuntos
            </Typography>
          )}
        </List>
      )}

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Reportes Generados por el Sistema
      </Typography>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Tipo</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Archivo</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Fecha / Hora</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Médico</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {systemReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No hay reportes generados
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              systemReports.map(doc => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <Chip
                      label={doc.report_type ? doc.report_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Reporte'}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PictureAsPdfIcon sx={{ fontSize: 16, color: '#d32f2f' }} />
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        {doc.file_name || 'Documento'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                      {doc.created_at ? moment(doc.created_at).format('DD/MM/YYYY HH:mm') : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                      {doc.uploaded_by ? `${doc.uploaded_by.name} ${doc.uploaded_by.lastname}` : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleDownload(doc)} disabled={!doc.file_url}>
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                    {canManage && (
                      <IconButton size="small" onClick={() => handleDelete(doc.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
