import axios from 'axios';
const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT
const axiosInstance = axios.create({ baseURL: `${API_ENDPOINT}` })

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const BackendAPI = {
    auth: {
        signIn: async (email, password) => {
            const res = await axiosInstance.post('/api/v1/auth/sign_in', { email, password })
            return res.data
        },
        signUp: async (user) => {
            const res = await axiosInstance.post('/api/v1/auth/sign_up', { user })
            return res.data
        },
        signOut: async () => {
            const res = await axiosInstance.delete('/api/v1/auth/sign_out')
            return res.data
        },
        forgotPassword: async (email) => {
            const res = await axiosInstance.post('/api/v1/auth/forgot_password', { email })
            return res.data
        },
        resetPassword: async (data) => {
            const res = await axiosInstance.put('/api/v1/auth/reset_password', data)
            return res.data
        },
    },
    patients: {
        getAll: async () => {
            const res = await axiosInstance.get("/patients")
            return res.data
        },
        create: async (patient) => {
            const res = await axiosInstance.post('/patients', patient)
            return res.data
        },
        delete: async (id) => {
            const res = await axiosInstance.delete('/patients/' + id)
            return res.data
        },
        update: async (patient) => {
            const res = await axiosInstance.put('/patients/'+patient.id, patient)
            return res.data
        },
        getById: async(id)=>{
            const res = await axiosInstance.get('/patients/' + id)
            return res.data
        },
        findByCi: async (ci) => {
            try {
                const res = await axiosInstance.get('/patients/find_by_ci', { params: { ci } })
                return res.data
            }
            catch (e) {
                return null
            }
        }
    },
    doctors: {
        getAll: async () => {
            const res = await axiosInstance.get("/doctors")
            return res.data
        },
        create: async (doctor) => {
            const res = await axiosInstance.post('/doctors', doctor)
            return res.data
        },
        delete: async (id) => {
            const res = await axiosInstance.delete('/doctors/' + id)
            return res.data
        },
        update: async (doctor) => {
            const res = await axiosInstance.put('/doctors/'+doctor.id, doctor)
            return res.data
        },
        getById: async(id)=>{
            const res = await axiosInstance.get('/doctors/' + id)
            return res.data
        }
    },
    rooms: {
        getAll: async () => {
            const res = await axiosInstance.get("/rooms")
            return res.data
        },
        update: async (room) => {
            const res = await axiosInstance.put('/rooms/'+room.id, room)
            return res.data
        },
    },
    emergencies: {
        getAll: async () => {
            const res = await axiosInstance.get("/emergencies")
            return res.data
        },
        create: async (emergency) => {
            const res = await axiosInstance.post('/emergencies', emergency)
            return res.data
        },
        update: async (emergency) => {
            const res = await axiosInstance.put('/emergencies/' + emergency.id, emergency)
            return res.data
        },
        getById: async (id) => {
            const res = await axiosInstance.get('/emergencies/' + id)
            return res.data
        },
    },
    notes: {
        getAll: async () => {
            const res = await axiosInstance.get("/notes")
            return res.data
        },
        create: async (note) => {
            const res = await axiosInstance.post('/notes', note)
            return res.data
        },
        update: async (note) => {
            const res = await axiosInstance.put('/notes/' + note.id, note)
            return res.data
        },
        delete: async (id) => {
            await axiosInstance.delete('/notes/' + id)
        },
    },
    users: {
        getAll: async () => {
            const res = await axiosInstance.get("/users")
            return res.data
        },
        create: async (user) => {
            const res = await axiosInstance.post('/users', user)
            return res.data
        },
        update: async (user) => {
            const res = await axiosInstance.put('/users/' + user.id, user)
            return res.data
        },
        changePassword: async (id, data) => {
            const res = await axiosInstance.put('/users/' + id + '/change_password', data)
            return res.data
        },
        delete: async (id) => {
            await axiosInstance.delete('/users/' + id)
        },
        updatePermissions: async (id, data) => {
            const res = await axiosInstance.put('/users/' + id + '/update_permissions', data)
            return res.data
        },
        getProfiles: async () => {
            const res = await axiosInstance.get('/users/profiles')
            return res.data
        },
    },
    profiles: {
        getAll: async () => {
            const res = await axiosInstance.get('/profiles')
            return res.data
        },
        create: async (profile) => {
            const res = await axiosInstance.post('/profiles', profile)
            return res.data
        },
        update: async (profile) => {
            const res = await axiosInstance.put('/profiles/' + profile.id, profile)
            return res.data
        },
        delete: async (id) => {
            await axiosInstance.delete('/profiles/' + id)
        },
        getUsers: async (profileId) => {
            const res = await axiosInstance.get('/profiles/' + profileId + '/users')
            return res.data
        },
    },
    emailSettings: {
        show: async () => {
            const res = await axiosInstance.get('/email_settings')
            return res.data
        },
        update: async (data) => {
            const res = await axiosInstance.put('/email_settings', data)
            return res.data
        },
        test: async (data) => {
            const res = await axiosInstance.post('/email_settings/test', data)
            return res.data
        },
    },
}
