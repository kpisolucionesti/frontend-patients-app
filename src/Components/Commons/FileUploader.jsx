import { useRef, useState } from 'react';
import { Box, Typography, IconButton, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';

const DEFAULT_ACCEPT = 'application/pdf';
const DEFAULT_MAX_SIZE = 10 * 1024 * 1024;

export default function FileUploader({ onFileSelect, accept = DEFAULT_ACCEPT, multiple = false, maxSize = DEFAULT_MAX_SIZE }) {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);

  const validateFile = (file) => {
    setError(null);
    const allowedTypes = accept.split(',').map(t => t.trim());
    const isAllowed = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        const category = type.split('/')[0];
        return file.type.startsWith(category + '/');
      }
      return file.type === type || type === '*';
    });
    if (!isAllowed) {
      setError(`Tipo de archivo no permitido. Solo se aceptan: ${accept}`);
      return false;
    }
    if (file.size > maxSize) {
      const sizeMB = (maxSize / (1024 * 1024)).toFixed(0);
      setError(`El archivo excede el tamaño máximo de ${sizeMB} MB`);
      return false;
    }
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    const valid = dropped.filter(validateFile);
    if (valid.length === 0) return;
    setFiles(multiple ? valid : [valid[0]]);
    onFileSelect(multiple ? valid : valid[0]);
  };

  const handleClick = () => inputRef.current?.click();

  const handleChange = (e) => {
    const selected = Array.from(e.target.files);
    const valid = selected.filter(validateFile);
    if (valid.length === 0) return;
    setFiles(multiple ? valid : [valid[0]]);
    onFileSelect(multiple ? valid : valid[0]);
  };

  const handleRemove = (idx) => {
    const updated = files.filter((_, i) => i !== idx);
    setFiles(updated);
    onFileSelect(null);
  };

  return (
    <Box>
      {error && <Alert severity="warning" sx={{ mb: 1, fontSize: '0.75rem' }}>{error}</Alert>}
      <Box
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={handleClick}
        sx={{
          border: '2px dashed #ccc',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          hidden
          multiple={multiple}
          accept={accept}
          onChange={handleChange}
        />
        {files.length === 0 ? (
          <Box>
            <CloudUploadIcon sx={{ fontSize: 28, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              Arrastra archivos aquí o haz clic para seleccionar
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Solo PDF — Máximo {(maxSize / (1024 * 1024)).toFixed(0)} MB
            </Typography>
          </Box>
        ) : (
          files.map((f, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
              <Typography variant="body2">{f.name}</Typography>
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleRemove(i); }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
}
