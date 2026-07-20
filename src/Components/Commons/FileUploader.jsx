import { useRef, useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';

export default function FileUploader({ onFileSelect, accept = '*', multiple = false }) {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    setFiles(multiple ? dropped : [dropped[0]]);
    onFileSelect(multiple ? dropped : dropped[0]);
  };

  const handleClick = () => inputRef.current?.click();

  const handleChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(multiple ? selected : [selected[0]]);
    onFileSelect(multiple ? selected : selected[0]);
  };

  const handleRemove = (idx) => {
    const updated = files.filter((_, i) => i !== idx);
    setFiles(updated);
    onFileSelect(null);
  };

  return (
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
  );
}
