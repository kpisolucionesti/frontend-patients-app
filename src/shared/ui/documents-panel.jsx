import { useState, useCallback } from 'react';
import {
  Box, Typography, IconButton, List, ListItem, ListItemText,
  ListItemIcon, Chip, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FileUploader from './file-uploader';
import usePermissions from '../../hooks/usePermissions';
import { BackendAPI } from '../../services/BackendApi';
import { useFetch } from '../../hooks/useFetch';
import moment from 'moment';

export default function DocumentsPanel({ attachableType, attachableId, managePermission, emergencyId, patientId }) {
  const permissions = usePermissions();
  const canManage = !managePermission || permissions.includes(managePermission);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const { data: rawDocs = [], loading, refetch } = useFetch(
    () => attachableId ? BackendAPI.documents.list(attachableType, attachableId) : Promise.resolve([]),
    [attachableType, attachableId],
  );
  const documents = rawDocs || [];

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
      refetch();
    } catch {
      setError('Error al subir archivo');
    } finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    try { await BackendAPI.documents.destroy(id); refetch(); }
    catch { setError('Error al eliminar archivo'); }
  };

  const handleDownload = (doc) => {
    if (doc.file_url) window.open(doc.file_url, '_blank');
  };

  const getIcon = (fileType) => {
    if (!fileType) return <AttachFileIcon fontSize="small" />;
    if (fileType.startsWith('image/')) return <ImageIcon fontSize="small" />;
    if (fileType.includes('pdf')) return <PictureAsPdfIcon fontSize="small" sx={{ color: 'error.main' }} />;
    return <DescriptionIcon fontSize="small" />;
  };

  const userUploads = documents.filter(d => !d.report_type);
  const systemReports = documents.filter(d => d.report_type);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="caption" fontWeight={700} sx={{ color: 'primary.main', fontSize: '0.75rem', letterSpacing: '0.03em' }}>
          DOCUMENTOS ADJUNTOS
        </Typography>
        {canManage && (
          <FileUploader onFileSelect={handleFileSelect} disabled={uploading}>
            <Button size="small" variant="outlined" startIcon={<UploadFileIcon />} disabled={uploading} sx={{ fontSize: '0.7rem' }}>
              {uploading ? 'Subiendo...' : 'Subir archivo'}
            </Button>
          </FileUploader>
        )}
      </Box>
      {error && (
        <Typography variant="caption" color="error" sx={{ display: 'block', mb: 1, fontSize: '0.7rem' }}>{error}</Typography>
      )}
      {uploading && <CircularProgress size={18} sx={{ display: 'block', mx: 'auto', mb: 1 }} />}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={18} /></Box>
      ) : userUploads.length > 0 ? (
        <TableContainer sx={{ borderRadius: 1, mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', py: 0.5 }}>Archivo</TableCell>
                <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', py: 0.5 }}>Tipo</TableCell>
                <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', py: 0.5 }}>Tamaño</TableCell>
                {canManage && <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', py: 0.5 }} width={60} />}
              </TableRow>
            </TableHead>
            <TableBody>
              {userUploads.map(doc => (
                <TableRow key={doc.id} hover>
                  <TableCell sx={{ fontSize: '0.72rem', py: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      {getIcon(doc.file_type)}
                      <Typography variant="body2" sx={{ fontSize: '0.72rem', cursor: doc.file_url ? 'pointer' : 'default' }}
                        onClick={() => doc.file_url && handleDownload(doc)}>
                        {doc.file_name || 'Archivo'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', py: 0.5, color: 'text.secondary' }}>
                    {doc.description || doc.file_type || '—'}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.7rem', py: 0.5 }}>
                    {doc.file_size || '—'}
                  </TableCell>
                  {canManage && (
                    <TableCell sx={{ py: 0.5 }}>
                      <IconButton size="small" onClick={() => handleDelete(doc.id)} sx={{ p: 0.15 }} aria-label="Eliminar archivo">
                        <DeleteIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, fontSize: '0.7rem' }}>
          No hay documentos adjuntos
        </Typography>
      )}

      <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', fontSize: '0.7rem', letterSpacing: '0.03em', display: 'block', mb: 1 }}>
        REPORTES GENERADOS
      </Typography>

      <TableContainer sx={{ borderRadius: 1 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', py: 0.5 }}>Tipo</TableCell>
              <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', py: 0.5 }}>Archivo</TableCell>
              <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', py: 0.5 }}>Fecha</TableCell>
              <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', py: 0.5 }}>Médico</TableCell>
              <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600, fontSize: '0.7rem', py: 0.5 }} width={70} />
            </TableRow>
          </TableHead>
          <TableBody>
            {systemReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>No hay reportes generados</Typography>
                </TableCell>
              </TableRow>
            ) : systemReports.map(doc => (
              <TableRow key={doc.id} hover>
                <TableCell sx={{ py: 0.5 }}>
                  <Chip label={doc.report_type ? doc.report_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Reporte'}
                    size="small" color="primary" variant="outlined" sx={{ fontSize: '0.7rem', height: 20 }} />
                </TableCell>
                <TableCell sx={{ fontSize: '0.72rem', py: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PictureAsPdfIcon sx={{ fontSize: 16, color: 'error.main' }} />
                    {doc.file_name || 'Documento'}
                  </Box>
                </TableCell>
                <TableCell sx={{ fontSize: '0.7rem', py: 0.5 }}>
                  {doc.created_at ? moment(doc.created_at).format('DD/MM/YYYY HH:mm') : '—'}
                </TableCell>
                <TableCell sx={{ fontSize: '0.7rem', py: 0.5 }}>
                  {doc.uploaded_by ? `${doc.uploaded_by.name} ${doc.uploaded_by.lastname}` : '—'}
                </TableCell>
                <TableCell sx={{ py: 0.5 }}>
                  <IconButton size="small" onClick={() => handleDownload(doc)} disabled={!doc.file_url} sx={{ p: 0.15 }} aria-label="Descargar">
                    <DownloadIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                  {canManage && (
                    <IconButton size="small" onClick={() => handleDelete(doc.id)} sx={{ p: 0.15 }} aria-label="Eliminar reporte">
                      <DeleteIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
