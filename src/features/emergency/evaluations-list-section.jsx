import React, { useState } from 'react';
import { Box, Paper, Typography, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import { useFetch } from '../../hooks/useFetch';
import { BackendAPI } from '../../services/BackendApi';
import EvaluationCard from '../../shared/ui/evaluation-card';
import SectionHeader from '../../shared/ui/section-header';

const EvaluationsListSection = React.memo(function EvaluationsListSection({ emergency }) {
  const [selectedEval, setSelectedEval] = useState(null);

  const evaluationsEnabled = !!emergency?.id;
  const { data: evaluationsData } = useFetch(
    () => evaluationsEnabled ? BackendAPI.evaluations.getAll(emergency.id) : Promise.resolve([]),
    [emergency?.id, evaluationsEnabled],
  );
  const evaluations = evaluationsData || [];

  if (!emergency || evaluations.length === 0) return null;

  return (
    <>
      <Paper sx={{ p: 1.5 }}>
        <SectionHeader icon={<DescriptionIcon sx={{ fontSize: 16 }} />} label="EVALUACIONES MÉDICAS" color="success.main" />
        {evaluations.map((ev) => {
          const isPrincipal = ev.doctor_id === emergency.primary_doctor?.id;
          return (
            <Box key={ev.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.5, borderBottom: 1, borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                  <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    {ev.doctor?.name || 'Médico'}
                    {(ev.doctor?.specialty?.name || ev.doctor?.specialty) && (
                      <Typography component="span" sx={{ fontSize: '0.7rem', color: 'text.secondary', ml: 0.25 }}>
                        {' · '}{ev.doctor?.specialty?.name || ev.doctor?.specialty}
                      </Typography>
                    )}
                  </Typography>
                  <Chip label={isPrincipal ? 'Principal' : 'Interconsulta'} size="small"
                    sx={{ height: 18, fontSize: '0.7rem', bgcolor: isPrincipal ? 'primary.main' : 'secondary.main', color: 'white', fontWeight: 600 }} />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  {ev.created_at ? new Date(ev.created_at).toLocaleDateString() : '—'}
                </Typography>
              </Box>
              <Button size="small" variant="outlined" onClick={() => setSelectedEval(ev)} sx={{ fontSize: '0.7rem', py: 0.1, px: 1 }}>
                Ver
              </Button>
            </Box>
          );
        })}
      </Paper>

      <Dialog open={!!selectedEval} onClose={() => setSelectedEval(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>
          DETALLE DE EVALUACIÓN
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedEval && <EvaluationCard evaluation={selectedEval} isPrimary={selectedEval.doctor_id === emergency.primary_doctor?.id} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedEval(null)} variant="outlined" color="error" sx={{ fontSize: '0.7rem' }}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
});

export default EvaluationsListSection;
