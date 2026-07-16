import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, Radio, RadioGroup, Stack } from "@mui/material";
import { FileDownloadOutlined } from "@mui/icons-material";
import React, { useCallback, useState } from "react";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

const ExportButton = ({ data, columns, filename = 'Reporte' }) => {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState('xlsx');

  const getExportData = useCallback(() => {
    if (!data || !data.length) {
      alert("NO EXISTEN REGISTROS PARA EXPORTAR");
      return null;
    }
    return data.map((row) => {
      const obj = {};
      columns.forEach((col) => {
        const key = col.accessorKey || col.header;
        obj[key] = resolveValue(row, col);
      });
      return obj;
    });
  }, [data, columns]);

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
    const headers = columns.map((c) => c.header);
    const rows = exportData.map((row) => headers.map((h) => String(row[h] ?? '')));
    doc.autoTable({
      head: [headers],
      body: rows,
      styles: { fontSize: 6, cellPadding: 1 },
      headStyles: { fillColor: [0, 0, 139], fontSize: 7 },
      margin: { top: 10 },
    });
    doc.save(`${filename}.pdf`);
  }, [filename, columns]);

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
      <Button variant="contained" color="primary" onClick={() => setOpen(true)} startIcon={<FileDownloadOutlined />} size="small">
        Exportar
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', textAlign: 'center', color: 'white' }}>
          EXPORTAR {filename.toUpperCase()}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
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
          <Button color="error" variant="contained" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button color="success" variant="contained" onClick={handleExport}>Descargar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ExportButton;
