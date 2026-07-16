import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, List, ListItem, ListItemText, Button, Divider, Paper } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RepeatIcon from '@mui/icons-material/Repeat';
import HistoryIcon from '@mui/icons-material/History';
import WarningIcon from '@mui/icons-material/Warning';
import { BackendAPI } from '../../services/BackendApi';
import HistoryDetailModal from '../History/HistoryDetailModal';
import AllergiesSection from './AllergiesSection';
import AntecedentsSection from './AntecedentsSection';
import MedicalPlansDetail from './MedicalPlansDetail';
import InterconsultationsDetail from './InterconsultationsDetail';

const StatCard = ({ icon, label, value, color }) => (
  <Card sx={{ bgcolor: color || '#f5f5f5' }}>
    <CardContent sx={{ py: 1, px: 1, '&:last-child': { pb: 1 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        {icon}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{label}</Typography>
          <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>{value ?? 'N/A'}</Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const PatientDashboard = ({ patient, stats, emergencyId }) => {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showAllCases, setShowAllCases] = useState(false);

  useEffect(() => {
    if (!patient) return;
    BackendAPI.emergencies.getAll({ patient_id: patient.id, per_page: 20 })
      .then((res) => {
        const all = res.data || [];
        setCases(all.filter((c) => c.status === 2 || c.status === 3 || c.status === 4 || c.status === 5));
      })
      .catch(() => {});
  }, [patient]);

  const displayCases = showAllCases ? cases : cases.slice(0, 3);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {patient?.disabled && (
        <Paper sx={{ p: 1, bgcolor: '#212121', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon sx={{ fontSize: 20 }} />
          <Typography variant="body2" fontWeight={700}>PACIENTE FALLECIDO — Solo lectura</Typography>
        </Paper>
      )}

      <Grid container spacing={1}>
        <Grid item xs={6}>
          <StatCard
            icon={<CalendarTodayIcon color="primary" sx={{ fontSize: 18 }} />}
            label="Última Visita"
            value={stats?.last_visit_date || 'N/A'}
            color="#e3f2fd"
          />
        </Grid>
        <Grid item xs={6}>
          <StatCard
            icon={<RepeatIcon color="secondary" sx={{ fontSize: 18 }} />}
            label="Total Visitas"
            value={stats?.total_visits ?? '0'}
            color="#f3e5f5"
          />
        </Grid>
      </Grid>

      <AllergiesSection patientId={patient?.id} readOnly={patient?.disabled} />
      <AntecedentsSection patientId={patient?.id} readOnly={patient?.disabled} />
      <MedicalPlansDetail emergencyId={emergencyId} readOnly={patient?.disabled} />
      <InterconsultationsDetail emergencyId={emergencyId} readOnly={patient?.disabled} />

      <Paper sx={{ p: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
          <HistoryIcon sx={{ fontSize: 16 }} />
          <Typography variant="caption" fontWeight={600} sx={{ color: '#6a1b9a' }}>CASOS ANTERIORES</Typography>
        </Box>
        {cases.length > 0 ? (
          <>
            <List dense disablePadding>
              {displayCases.map((c) => (
                <Box key={c.id}>
                  <ListItem
                    secondaryAction={
                      <Button size="small" sx={{ fontSize: '0.7rem', minWidth: 'auto' }} onClick={() => setSelectedCase(c)}>Detalle</Button>
                    }
                    disablePadding
                    sx={{ py: 0.25 }}
                  >
                    <ListItemText
                      primary={`${c.ingress_date} - ${c.diagnostic || 'Sin diagnóstico'}`}
                      primaryTypographyProps={{ fontSize: '0.7rem' }}
                      secondary={
                        <Box component="span" sx={{ display: 'inline-flex', gap: 0.5, alignItems: 'center' }}>
                          {c.status === 1 ? 'Atendido' : c.status === 2 ? 'Alta' : c.status === 3 ? 'Ingresado' : c.status === 4 ? 'Anulada' : c.status === 5 ? 'Fallecido' : 'Esperando'}
                        </Box>
                      }
                    />
                  </ListItem>
                  <Divider />
                </Box>
              ))}
            </List>
            {cases.length > 3 && (
              <Button size="small" sx={{ fontSize: '0.7rem', mt: 0.5 }} onClick={() => setShowAllCases(!showAllCases)}>
                {showAllCases ? 'Mostrar menos' : `Ver todos (${cases.length})`}
              </Button>
            )}
          </>
        ) : (
          <Typography variant="caption" color="text.secondary">Sin casos anteriores</Typography>
        )}
      </Paper>

      {selectedCase && (
        <HistoryDetailModal
          emergencyId={selectedCase.id}
          open={!!selectedCase}
          onClose={() => setSelectedCase(null)}
        />
      )}
    </Box>
  );
};

export default PatientDashboard;
