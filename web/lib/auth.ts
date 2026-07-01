import Cookies from 'js-cookie';

export const getToken = () => Cookies.get('token');

export const setToken = (token: string) =>
  Cookies.set('token', token, { secure: true, sameSite: 'strict' });

export const removeToken = () => Cookies.remove('token');

export const isAuthenticated = () => !!getToken();

export const getUsuario = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.id,
      email: payload.email,
      rol: payload.rol,
    };
  } catch {
    return null;
  }
};

export const logout = () => {
  removeToken();
  window.location.href = '/login';
};