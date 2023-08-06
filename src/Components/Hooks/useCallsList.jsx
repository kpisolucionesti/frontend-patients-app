import { BackendAPI } from "../../services/BackendApi";
import { useState } from "react";
import moment from "moment";

export const useCallList = () => {
    const [rooms, setRooms] = useState([])
    const [doctors, setDoctors] = useState([])
    const [patients, setPatients] = useState([])

    const callPatientsList = () => {
        BackendAPI.patients.getAll().then(res => {
            let newData = res.map(x => { return {...x, ingress_date: moment(x.ingress_date, 'DD/M/YYYY').format('MM/DD/YYYY')}})
            setPatients(newData)
        })
    }

    const callDoctorsList = () => {
        BackendAPI.doctors.getAll().then(res => setDoctors(res))
    }

    const callRoomsList = () => {
        BackendAPI.rooms.getAll().then(res => setRooms(res))
    }


    return { doctors, rooms, patients, setPatients, callDoctorsList, callPatientsList, callRoomsList }
}