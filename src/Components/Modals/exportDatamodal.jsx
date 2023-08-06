import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from "@mui/material";
import React, { useState } from "react";
import * as XLSX from 'xlsx';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import moment from "moment";
import { FileDownloadOutlined } from "@mui/icons-material";
import { useOpenModal } from "../Hooks/useOpenModal";

const ExportData = ({ apiData }) => {
    const [newData, setNewData] = useState([])
    const { open, handleOpen, handleClose } = useOpenModal()
    const today = moment()
    const orderData = apiData.map(x => {return ({fecha: x.ingress_date, ci: x.ci, paciente: x.name, edad: x.age, genero: x.gender, medico_tratante: x.current_doctor, diagnostico: x.current_diagnostic, tratamiento: x.treatment, egreso: x.medical_exit, ingreso: x.transfer, observaciones: x.observations })})

    const handleRangeDate = (value) => {
        const selectDate = moment(value._d).format('MM/DD/YYYY')
        if(!newData.length){
            const firstFilter = orderData.filter(f => f.fecha >= selectDate)
                setNewData(firstFilter)
        } else {
            const secondFilter = newData.filter(f => f.fecha <= selectDate)
                setNewData(secondFilter)
        }
    }

    const exportFile = () => {
        const data = !newData.length ? orderData.filter(f => f.fecha === moment(today).format('MM/DD/YYYY')) : newData
    
        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.json_to_sheet(data)
        XLSX.utils.book_append_sheet(wb, ws, "Data")
        XLSX.writeFile(wb, "Data.xlsx")
        handleClose()
    }

    return(
        <>
            <Button variant="contained" onClick={handleOpen} startIcon={<FileDownloadOutlined />} >Reporte</Button>
            <Dialog open={open} onClose={handleClose} >
                <DialogTitle sx={{ bgcolor: 'blue', textAlign: 'center', color: 'white', fontWeight: 'bold' }} >EXPORTAR DATOS</DialogTitle>
                <DialogContent>
                    <LocalizationProvider dateAdapter={AdapterMoment}>
                        <Stack sx={{ mt: 2 }} direction='row' spacing={2} >
                            <DatePicker minDate={moment('06/22/2023')} defaultValue={today} label='Fecha Inicial' onChange={(e) => handleRangeDate(e)} />
                            <DatePicker label='Fecha Final' defaultValue={today} onChange={(e) => handleRangeDate(e)} />
                        </Stack>
                    </LocalizationProvider>
                </DialogContent>
                <DialogActions>
                    <Button color="error" variant="contained" onClick={handleClose}>Cerrar</Button>
                    <Button color="success" variant="contained" onClick={exportFile}>Guardar</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default ExportData