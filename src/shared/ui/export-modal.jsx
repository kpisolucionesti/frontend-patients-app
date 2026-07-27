import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, Radio, RadioGroup, Stack } from "@mui/material";
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { FileDownloadOutlined } from "@mui/icons-material";
import React, { useCallback, useMemo, useState } from "react";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment';

const EMERGENCY_HEADERS = [
  'Fecha', 'Cedula', 'Paciente', 'Edad', 'Genero',
  'Medico Tratante', 'Interconsultas', 'Diagnostico',
  'Tratamiento', 'Egreso', 'Ingreso', 'Observaciones',
  'Creado por',
];

const EMERGENCY_KEY_MAP = {
  'Fecha': (x) => moment(x.ingress_date).format("YYYY-MM-DD"),
  'Cedula': (x) => x.patient?.ci || '',
  'Paciente': (x) => x.patient?.name || '',
  'Edad': (x) => x.patient?.age || '',
  'Genero': (x) => x.patient?.gender || '',
  'Medico Tratante': (x) => x.primary_doctor?.name || '',
  'Interconsultas': (x) => (x.doctors || []).filter((d) => d.id !== x.primary_doctor?.id).map((d) => d.name).join(', '),
  'Diagnostico': (x) => x.diagnostic,
  'Tratamiento': (x) => x.treatment,
  'Egreso': (x) => x.medical_exit,
  'Ingreso': (x) => x.transfer,
  'Observaciones': (x) => x.observations,
  'Creado por': (x) => x.created_by?.name || '',
};

const resolveValue = (row, col) => {
  if (col.accessorFn) return col.accessorFn(row);
  if (col.accessorKey) {
    const keys = col.accessorKey.split('.');
    let val = row;
    for (const key of keys) {
      if (val == null) return '';
      val = val[key];
    }
    return val ?? '';
  }
  return '';
};

const ExportModal = ({ data, columns, filename = 'Reporte', showDateFilter = false, buttonLabel }) => {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState('xlsx');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const mappedData = useMemo(() => {
    if (columns) return (data || []).map((row) => {
      const obj = {};
      columns.forEach((col) => {
        const key = col.accessorKey || col.header;
        obj[key] = resolveValue(row, col);
      });
      return obj;
    });
    return (data || []).map((x) => {
      const obj = {};
      EMERGENCY_HEADERS.forEach((h) => { obj[h] = EMERGENCY_KEY_MAP[h](x); });
      return obj;
    });
  }, [data, columns]);

  const filteredData = useMemo(() => {
    if (!showDateFilter) return mappedData;
    return mappedData.filter((row) => {
      const fecha = row['Fecha'] || '';
      if (startDate && fecha < moment(startDate).format('YYYY-MM-DD')) return false;
      if (endDate && fecha > moment(endDate).format('YYYY-MM-DD')) return false;
      return true;
    });
  }, [mappedData, showDateFilter, startDate, endDate]);

  const getExportData = useCallback(() => {
    const exportData = showDateFilter && !startDate && !endDate
      ? mappedData.filter((f) => f['Fecha'] === moment().format('YYYY-MM-DD'))
      : filteredData;
    if (!exportData.length) {
      alert("NO EXISTEN REGISTROS PARA EXPORTAR");
      return null;
    }
    return exportData;
  }, [mappedData, filteredData, showDateFilter]);

  const exportToXLSX = useCallback((exportData) => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  }, [filename]);

  const exportToCSV = useCallback((exportData) => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `${filename}.csv`, { bookType: 'csv' });
  }, [filename]);

  const exportToPDF = useCallback((exportData) => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const headers = Object.keys(exportData[0]);
    const rows = exportData.map((row) => headers.map((h) => String(row[h] ?? '')));
    doc.autoTable({
      head: [headers],
      body: rows,
      styles: { fontSize: 6, cellPadding: 1 },
      headStyles: { fillColor: [0, 0, 139], fontSize: 7 },
      margin: { top: 10 },
    });
    doc.save(`${filename}.pdf`);
  }, [filename]);

  const handleExport = useCallback(() => {
    const exportData = getExportData();
    if (!exportData) return;

    switch (format) {
      case 'xlsx': exportToXLSX(exportData); break;
      case 'csv': exportToCSV(exportData); break;
      case 'pdf': exportToPDF(exportData); break;
      default: exportToXLSX(exportData);
    }
    setOpen(false);
  }, [format, getExportData, exportToXLSX, exportToCSV, exportToPDF]);

  return (
    <>
      <Button variant="outlined" onClick={() => setOpen(true)} startIcon={<FileDownloadOutlined />} size="small">
        {buttonLabel || 'Reporte'}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', textAlign: 'center', color: 'white' }}>
          EXPORTAR DATOS
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {showDateFilter && (
              <LocalizationProvider dateAdapter={AdapterMoment}>
                <Stack direction="row" spacing={1}>
                  <DatePicker format="DD/MM/YYYY" label='Fecha Inicial' onChange={(e) => setStartDate(e)} slotProps={{ textField: { variant: 'standard' } }} />
                  <DatePicker format="DD/MM/YYYY" label='Fecha Final' onChange={(e) => setEndDate(e)} slotProps={{ textField: { variant: 'standard' } }} />
                </Stack>
              </LocalizationProvider>
            )}
            <FormControl sx={{ width: '100%' }}>
              <RadioGroup row value={format} onChange={(e) => setFormat(e.target.value)}>
                <FormControlLabel value="xlsx" control={<Radio />} label="Excel" />
                <FormControlLabel value="pdf" control={<Radio />} label="PDF" />
                <FormControlLabel value="csv" control={<Radio />} label="CSV" />
              </RadioGroup>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button color="error" variant="outlined" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button color="success" variant="outlined" onClick={handleExport}>Descargar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ExportModal;
