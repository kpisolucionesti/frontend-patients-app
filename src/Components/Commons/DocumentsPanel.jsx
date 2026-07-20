import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, IconButton, List, ListItem, ListItemText,
  ListItemIcon, ListItemSecondaryAction, Chip, CircularProgress, Alert
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { BackendAPI } from '../../services/BackendApi';
import FileUploader from './FileUploader';

export default function DocumentsPanel({ attachableType, attachableId }) {
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

  const getIcon = (fileType) => {
    if (!fileType) return <AttachFileIcon />;
    if (fileType.startsWith('image/')) return <ImageIcon />;
    if (fileType.includes('pdf')) return <PictureAsPdfIcon />;
    return <DescriptionIcon />;
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>Documentos Adjuntos</Typography>
      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
      <FileUploader onFileSelect={handleFileSelect} disabled={uploading} />
      {uploading && <CircularProgress size={24} sx={{ display: 'block', mx: 'auto', mt: 1 }} />}
      {loading ? (
        <CircularProgress size={24} sx={{ display: 'block', mx: 'auto', mt: 2 }} />
      ) : (
        <List dense>
          {documents.map(doc => (
            <ListItem key={doc.id}>
              <ListItemIcon>{getIcon(doc.file_type)}</ListItemIcon>
              <ListItemText
                primary={doc.file_name || 'Archivo'}
                secondary={doc.description || doc.file_type}
              />
              <Chip label={doc.file_size || ''} size="small" sx={{ mr: 1 }} />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleDelete(doc.id)} size="small">
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          {documents.length === 0 && !loading && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              No hay documentos adjuntos
            </Typography>
          )}
        </List>
      )}
    </Box>
  );
}
