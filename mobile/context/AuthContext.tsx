import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { API_URL } from '../config';
import { AuthResponse, Mascota } from '../types';

interface AuthContextType {
  token: string | null;
  usuario: {
    id: string;
    nombre: string;
    email: string;
    telefono?: string;
    propietarioId: string;
    rol: string;
  } | null;
  mascotas: Mascota[];
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (nombre: string, email: string, telefono: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateMascotas: (mascotas: Mascota[]) => void;
  refreshMascotas: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<AuthContextType['usuario']>(null);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUsuario = await AsyncStorage.getItem('usuario');

      if (storedToken && storedUsuario) {
        setToken(storedToken);
        setUsuario(JSON.parse(storedUsuario));
        await refreshMascotas(storedToken);
      }
    } catch (error) {
      console.error('Error cargando sesión:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshMascotas = async (tk?: string) => {
    try {
      const activeToken = tk || token;
      if (!activeToken) return;

      const response = await fetch(`${API_URL}/mascotas`, {
        headers: { Authorization: `Bearer ${activeToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setMascotas(data);
      } else if (response.status === 401) {
        await logout();
      }
    } catch (error) {
      console.error('Error refreshing mascotas:', error);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data: AuthResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al iniciar sesión');
    }

    const usuarioData = {
      id: data.usuarioId,
      nombre: data.nombre,
      email: data.email,
      telefono: data.telefono,
      propietarioId: data.propietarioId,
      rol: data.rol,
    };

    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('usuario', JSON.stringify(usuarioData));

    setToken(data.token);
    setUsuario(usuarioData);
    setMascotas(data.mascotas || []);

    if (data.mascotas && data.mascotas.length > 0) {
      router.replace('/(tabs)');
    } else {
      router.replace('/mascota-inicial');
    }
  };

  const register = async (nombre: string, email: string, telefono: string, password: string) => {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, telefono, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al registrarse');
    }

    const usuarioData = {
      id: data.usuarioId,
      nombre: data.nombre,
      email: data.email,
      telefono,
      propietarioId: data.propietarioId,
      rol: 'propietario',
    };

    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('usuario', JSON.stringify(usuarioData));

    setToken(data.token);
    setUsuario(usuarioData);
    setMascotas([]);

    router.replace('/mascota-inicial');
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${API_URL}/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      await AsyncStorage.clear();
      setToken(null);
      setUsuario(null);
      setMascotas([]);
      router.replace('/login');
    }
  };

  const updateMascotas = (newMascotas: Mascota[]) => {
    setMascotas(newMascotas);
  };

  return (
    <AuthContext.Provider value={{
      token,
      usuario,
      mascotas,
      loading,
      login,
      register,
      logout,
      updateMascotas,
      refreshMascotas,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}