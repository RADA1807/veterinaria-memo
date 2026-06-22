import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://veterinaria-memo.vercel.app';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      Cookies.remove('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const login = (email: string, password: string) =>
  api.post('/api/login', { email, password });

// Dashboard stats
export const getCitas = () => api.get('/api/citas');
export const getMascotas = () => api.get('/api/mascotas');
export const getPropietarios = () => api.get('/api/propietarios');
export const getServicios = () => api.get('/api/servicios');

// Citas
export const updateEstadoCita = (id: string, estado: string, nota_admin?: string) =>
  api.put(`/api/citas/${id}/estado`, { estado, nota_admin });

// Mascotas
export const updateMascota = (id: string, data: object) =>
  api.put(`/api/mascotas/${id}`, data);
export const deleteMascota = (id: string) =>
  api.delete(`/api/mascotas/${id}`);

// Propietarios
export const getPropietario = (id: string) =>
  api.get(`/api/propietarios/${id}`);
export const deletePropietario = (id: string) =>
  api.delete(`/api/propietarios/${id}`);

// Servicios
export const createServicio = (data: object) =>
  api.post('/api/servicios', data);
export const updateServicio = (id: string, data: object) =>
  api.put(`/api/servicios/${id}`, data);
export const deleteServicio = (id: string) =>
  api.delete(`/api/servicios/${id}`);
// Invitaciones
export const generarInvitacion = () =>
  api.post('/api/generar-invitacion');

// Tratamientos
export const getTratamientos = () => api.get('/api/tratamientos');
export const getTratamientosMascota = (mascotaId: string) => api.get(`/api/tratamientos/mascota/${mascotaId}`);
export const createTratamiento = (data: object) => api.post('/api/tratamientos', data);
export const updateTratamiento = (id: string, data: object) => api.put(`/api/tratamientos/${id}`, data);
export const deleteTratamiento = (id: string) => api.delete(`/api/tratamientos/${id}`);

export default api;
