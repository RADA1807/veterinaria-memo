export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  rol: 'propietario' | 'admin' | 'veterinario';
}

export interface Propietario {
  id: string;
  nombre: string;
  correo: string;
  telefono?: string;
  direccion?: string;
  usuario_id: string;
}

export interface Mascota {
  id: string;
  nombre: string;
  especie: string;
  raza: string;
  edad: number;
  historial_medico?: string;
  propietario_id: string;
}

export interface Cita {
  id: string;
  mascota_id: string;
  mascota_nombre?: string;
  propietario_id: string;
  propietario_nombre?: string;
  fecha: string;
  hora: string;
  motivo: string;
  servicio: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
}

export interface Servicio {
  id: number;
  nombre: string;
  descripcion?: string;
  duracion_minutos: number;
  precio: string;
}

export interface Tratamiento {
  id: number;
  paciente_id: string;
  mascota_nombre?: string;
  tipo: string;
  descripcion?: string;
  costo: number;
  fecha: string;
  veterinario?: string;
}

export interface AuthResponse {
  token: string;
  usuarioId: string;
  propietarioId: string;
  nombre: string;
  email: string;
  telefono?: string;
  rol: string;
  mascotas: Mascota[];
}

export interface Mascota {
  id: string;
  nombre: string;
  especie: string;
  raza: string;
  edad: number;
  historial_medico?: string;
  foto?: string;
  propietario_id: string;
}