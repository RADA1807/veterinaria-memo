'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { setToken } from '@/lib/auth';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://veterinaria-memo.vercel.app';

export default function RegisterPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [codigo, setCodigo] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/register-admin`, {
        nombre, email, telefono, password, codigo
      });

      setToken(res.data.token);
      
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al registrarse');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ background: 'linear-gradient(135deg, #003B6E 0%, #005fa3 50%, #00A99D 100%)' }}>

        {/* Logo + nombre */}
        <div className="flex items-center gap-3">
          <Image
            src="https://veterinariamemo.com/wp-content/uploads/2023/02/SINFONDO-1024x1024.png"
            alt="Veterinaria Memo"
            width={48}
            height={48}
            className="rounded-xl"
          />
          <span className="text-white font-display text-xl font-semibold">Veterinaria Memo</span>
        </div>

        <div>
          <h1 className="text-white font-display text-5xl font-bold leading-tight mb-6">
            Crear cuenta<br />de administrador
          </h1>
          <p className="text-white/70 text-lg max-w-sm">
            Regístrate para gestionar citas, mascotas, propietarios y servicios.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Citas', icon: '📅' },
            { label: 'Mascotas', icon: '🐾' },
            { label: 'Clientes', icon: '👥' },
          ].map((item) => (
            <div key={item.label} className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/20">
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-white/80 text-sm">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <Image
              src="https://veterinariamemo.com/wp-content/uploads/2023/02/SINFONDO-1024x1024.png"
              alt="Veterinaria Memo"
              width={40}
              height={40}
              className="rounded-xl"
            />
            <span className="font-display text-xl font-semibold" style={{ color: '#003B6E' }}>
              Veterinaria Memo
            </span>
          </div>

          <h2 className="font-display text-3xl font-bold text-slate-800 mb-2">Crear cuenta</h2>
          <p className="text-slate-500 mb-8">Regístrate como administrador</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Nombre completo
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre completo"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-all text-slate-800 placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@veterinariamemo.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-all text-slate-800 placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Teléfono
              </label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="8888-8888"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-all text-slate-800 placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-all text-slate-800 placeholder-slate-400"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-all text-slate-800 placeholder-slate-400"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Código de invitación
              </label>
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                placeholder="INV-XXXXXX"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-all text-slate-800 placeholder-slate-400 tracking-widest font-mono"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm">
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-base transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #F5A623, #E09010)' }}
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>

            <p className="text-center text-sm text-slate-500">
              ¿Ya tienes cuenta?{' '}
              <a href="/login" className="font-semibold" style={{ color: '#00A99D' }}>
                Inicia sesión aquí
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}