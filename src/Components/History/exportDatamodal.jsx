import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from "@mui/material";
import React, { useCallback, useMemo, useState } from "react";
import * as XLSX from 'xlsx';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from "moment";
import { FileDownloadOutlined } from "@mui/icons-material";

const ExportData = ({ apiData }) => {
    const [open, setOpen] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const orderData = useMemo(
      () => (apiData || []).map((x) => ({
        fecha: moment(x.ingress_date, 'YYYY/MM/DD').format("YYYY-MM-DD"),
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

    const exportFile = useCallback(() => {
        const data = filteredData.length ? filteredData : orderData.filter((f) => f.fecha === moment().format('YYYY-MM-DD'));
        if (!data.length) {
            alert("NO EXISTEN REGISTROS EN LAS FECHAS SELECCIONADAS");
            return;
        }
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Data");
        XLSX.writeFile(wb, "Data.xlsx");
        setOpen(false);
    }, [filteredData, orderData]);

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
                </DialogContent>
                <DialogActions>
                    <Button color="error" variant="contained" onClick={handleClose}>Cerrar</Button>
                    <Button color="success" variant="contained" onClick={exportFile}>Guardar</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ExportData;
