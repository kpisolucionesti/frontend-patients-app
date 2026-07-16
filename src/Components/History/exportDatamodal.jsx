import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, Radio, RadioGroup, Stack } from "@mui/material";
import React, { useCallback, useMemo, useState } from "react";
import * as XLSX from 'xlsx';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from "moment";
import { FileDownloadOutlined } from "@mui/icons-material";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const HEADERS = [
    'Fecha', 'Cedula', 'Paciente', 'Edad', 'Genero',
    'Medico Tratante', 'Interconsultas', 'Diagnostico',
    'Tratamiento', 'Egreso', 'Ingreso', 'Observaciones',
    'Creado por',
];

const KEY_MAP = {
    'Fecha': 'fecha',
    'Cedula': 'ci',
    'Paciente': 'paciente',
    'Edad': 'edad',
    'Genero': 'genero',
    'Medico Tratante': 'medico_tratante',
    'Interconsultas': 'interconsultas',
    'Diagnostico': 'diagnostico',
    'Tratamiento': 'tratamiento',
    'Egreso': 'egreso',
    'Ingreso': 'ingreso',
    'Observaciones': 'observaciones',
    'Creado por': 'creado_por',
};

const ExportData = ({ apiData }) => {
    const [open, setOpen] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [format, setFormat] = useState('xlsx');

    const orderData = useMemo(
      () => (apiData || []).map((x) => ({
        fecha: moment(x.ingress_date).format("YYYY-MM-DD"),
        ci: x.patient?.ci || '',
        paciente: x.patient?.name || '',
        edad: x.patient?.age || '',
        genero: x.patient?.gender || '',
        medico_tratante: x.primary_doctor?.name || '',
        interconsultas: (x.doctors || []).filter((d) => d.id !== x.primary_doctor?.id).map((d) => d.name).join(', '),
        diagnostico: x.diagnostic,
        tratamiento: x.treatment,
        egreso: x.medical_exit,
        ingreso: x.transfer,
        observaciones: x.observations,
        creado_por: x.created_by?.name || '',
      })),
      [apiData],
    );

    const filteredData = useMemo(() => {
      let data = orderData;
      if (startDate) {
        const start = moment(startDate).format('YYYY-MM-DD');
        data = data.filter((f) => f.fecha >= start);
      }
      if (endDate) {
        const end = moment(endDate).format('YYYY-MM-DD');
        data = data.filter((f) => f.fecha <= end);
      }
      return data;
    }, [orderData, startDate, endDate]);

    const handleOpen = () => setOpen(true);

    const handleClose = useCallback(() => {
        setOpen(false);
        setStartDate(null);
        setEndDate(null);
    }, []);

    const getExportData = useCallback(() => {
        const data = filteredData.length ? filteredData : orderData.filter((f) => f.fecha === moment().format('YYYY-MM-DD'));
        if (!data.length) {
            alert("NO EXISTEN REGISTROS EN LAS FECHAS SELECCIONADAS");
            return null;
        }
        return data;
    }, [filteredData, orderData]);

    const exportToXLSX = useCallback((data) => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Data");
        XLSX.writeFile(wb, "Data.xlsx");
    }, []);

    const exportToCSV = useCallback((data) => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Data");
        XLSX.writeFile(wb, "Data.csv", { bookType: 'csv' });
    }, []);

    const exportToPDF = useCallback((data) => {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const rows = data.map((row) => HEADERS.map((h) => String(row[KEY_MAP[h]] ?? '')));
        doc.autoTable({
            head: [HEADERS],
            body: rows,
            styles: { fontSize: 6, cellPadding: 1 },
            headStyles: { fillColor: [0, 0, 139], fontSize: 7 },
            margin: { top: 10 },
        });
        doc.save("Data.pdf");
    }, []);

    const handleExport = useCallback(() => {
        const data = getExportData();
        if (!data) return;

        switch (format) {
            case 'xlsx':
                exportToXLSX(data);
                break;
            case 'csv':
                exportToCSV(data);
                break;
            case 'pdf':
                exportToPDF(data);
                break;
            default:
                exportToXLSX(data);
        }
        setOpen(false);
    }, [format, getExportData, exportToXLSX, exportToCSV, exportToPDF]);

    return (
        <>
            <Button variant="contained" onClick={handleOpen} startIcon={<FileDownloadOutlined />}>
                Reporte
            </Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle sx={{ bgcolor: 'blue', textAlign: 'center', color: 'white' }}>
                    EXPORTAR DATOS
                </DialogTitle>
                <DialogContent>
                    <LocalizationProvider dateAdapter={AdapterMoment}>
                        <Stack sx={{ mt: 2 }} direction='row' spacing={2}>
                            <DatePicker format="DD/MM/YYYY" label='Fecha Inicial' onChange={(e) => setStartDate(e)} />
                            <DatePicker format="DD/MM/YYYY" label='Fecha Final' onChange={(e) => setEndDate(e)} />
                        </Stack>
                    </LocalizationProvider>
                    <FormControl sx={{ mt: 2, width: '100%' }}>
                        <RadioGroup row value={format} onChange={(e) => setFormat(e.target.value)}>
                            <FormControlLabel value="xlsx" control={<Radio />} label="Excel" />
                            <FormControlLabel value="pdf" control={<Radio />} label="PDF" />
                            <FormControlLabel value="csv" control={<Radio />} label="CSV" />
                        </RadioGroup>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button color="error" variant="contained" onClick={handleClose}>Cerrar</Button>
                    <Button color="success" variant="contained" onClick={handleExport}>Guardar</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ExportData;
