import moment from "moment";
import { BackendAPI } from "../../../../services/BackendApi";
import { useCallList } from "./useCallsList";

export const useActions = ( row, rooms ) => {
    const { patients, setPatients } = useCallList()

    const handleCreate = (data, room) => {
        BackendAPI.patients.create(data).then(res => {
            console.log(res)
            BackendAPI.rooms.update({...room, patient_id: res.id}).then(res => console.log(res))
        })
    }
    
    const handleEdit = (data) => {
        BackendAPI.patients.update(data).then(res => {
            let userIndex = patients.findIndex(x=>x.id === data.id)
            let newState = [...patients];
            newState[userIndex]=res;
            setPatients(newState);
        })
    }

    const handleRelease = (values, status) => {
        let filterRoom = rooms.find(f => f.patient_id === row.id)
        if(Object.keys(values).length) {
            let data = {...row, ...values, status: status, ingress_date: moment(row.ingress_date, 'MM/DD/YYYY').format('DD/M/YYYY') }
            BackendAPI.patients.update(data).then()
            BackendAPI.rooms.update({...filterRoom, patient_id: null}).then()
        } else {
            alert("SELECCIONE UNA UBICACION")
        }
    }

    const handleAssingRoom = (values, row) => {
        let removeRoom = rooms.find(f => f.patient_id === row.id)
        if(Object.keys(values).length) {
            BackendAPI.rooms.update({...values, patient_id: row.id}).then()
            BackendAPI.rooms.update({...removeRoom, patient_id: null}).then()
        } else {
            alert("SELECCIONE UNA UBICACION")
        }
    }

    return { handleRelease, handleEdit, handleCreate, handleAssingRoom }
}