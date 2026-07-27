import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

const DeleteConfirmModal = ({ open, onClose, onConfirm, title, message, loading }) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle sx={{ fontSize: '0.85rem', bgcolor: 'error.main', color: 'white' }}>
      {title || 'Confirmar Eliminación'}
    </DialogTitle>
    <DialogContent sx={{ pt: 2 }}>
      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
        {message || '¿Está seguro de que desea eliminar este registro?'}
      </Typography>
    </DialogContent>
    <DialogActions sx={{ p: 1.5 }}>
      <Button size="small" variant="outlined" onClick={onClose} disabled={loading}>
        Cancelar
      </Button>
      <Button size="small" variant="contained" color="error" onClick={onConfirm} disabled={loading}>
        {loading ? 'Eliminando...' : 'Eliminar'}
      </Button>
    </DialogActions>
  </Dialog>
);

export default DeleteConfirmModal;