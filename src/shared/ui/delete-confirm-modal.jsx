import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

const DeleteConfirmModal = ({ open, onClose, onConfirm, title, message, loading }) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle sx={{ fontSize: '0.95rem', bgcolor: 'error.main', color: 'white', fontWeight: 700, textAlign: 'center' }}>
      {title || 'Confirmar Eliminación'}
    </DialogTitle>
    <DialogContent>
      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
        {message || '¿Está seguro de que desea eliminar este registro?'}
      </Typography>
    </DialogContent>
    <DialogActions>
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