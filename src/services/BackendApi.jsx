import axios from 'axios';
const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT
const axiosInstance = axios.create({ baseURL: `${API_ENDPOINT}` })

export const BackendAPI = {
    patients: {
        getAll: async () => {
            try {
                const res = await axiosInstance.get("/patients")
                return res.data
            }
            catch (e) {
                console.log(e)
            }
        },
        create: async (patient) => {
            try {
                const res = await axiosInstance.post('/patients', patient)
                return res.data
            }
            catch (e) {
                console.log(e)
            }
        },
        delete: async (id) => {
            try {
                const res = await axiosInstance.delete('/patients/' + id)
                return res.data
            }
            catch (e) {
                console.log(e)
            }
        },
        update: async (patient) => {
            try {
                const res = await axiosInstance.put('/patients/'+patient.id, patient)
                return res.data
            }
            catch (e) {
                console.log(e)
            }
        },
        getById: async(id)=>{
           try {
                const res = await axiosInstance.get('/patients/' + id)
                return res.data
            }
            catch (e) {
                console.log(e)
            }
        }
    },
    doctors: {
        getAll: async () => {
            try {
                const res = await axiosInstance.get("/doctors")
                return res.data
            }
            catch (e) {
                console.log(e)
            }
        },
        create: async (doctor) => {
            try {
                const res = await axiosInstance.post('/doctors', doctor)
                return res.data
            }
            catch (e) {
                console.log(e)
            }
        },
        delete: async (id) => {
            try {
                const res = await axiosInstance.delete('/doctors/' + id)
                return res.data
            }
            catch (e) {
                console.log(e)
            }
        },
        update: async (doctor) => {
            try {
                const res = await axiosInstance.put('/doctors/'+doctor.id, doctor)
                return res.data
            }
            catch (e) {
                console.log(e)
            }
        },
        getById: async(id)=>{
           try {
                const res = await axiosInstance.get('/doctors/' + id)
                return res.data
            }
            catch (e) {
                console.log(e)
            }
        }
    },
    rooms: {
        getAll: async () => {
            try {
                const res = await axiosInstance.get("/rooms")
                return res.data
            }
            catch (e) {
                console.log(e)
            }
        },
        update: async (room) => {
            try {
                const res = await axiosInstance.put('/rooms/'+room.id, room)
                return res.data
            }
            catch (e) {
                console.log(e)
            }
        },
    },
    emergencies: {
        getAll: async () => {
            try {
                const res = await axiosInstance.get("/emergencies")
                return res.data
            }
            catch (e) {
                console.log(e)
            }
        },
        create: async (emergency) => {
            try {
                const res = await axiosInstance.post('/emergencies', emergency)
                return res.data
            }
            catch (e) {
                console.log(e)
            }
        },
        update: async (emergency) => {
            try {
                const res = await axiosInstance.put('/emergencies/'+emergency.id, emergency)
                return res.data
            }
            catch (e) {
                console.log(e)
            }
        },
    },

}