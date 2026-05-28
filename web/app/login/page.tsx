'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api';
import { setToken } from '@/lib/auth';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      const { token, rol } = res.data;

      if (rol !== 'admin') {
        setError('Acceso solo para administradores');
        setLoading(false);
        return;
      }

      setToken(token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center gap-10 p-12"
        style={{ background: 'linear-gradient(135deg, #003B6E 0%, #005fa3 50%, #00A99D 100%)' }}>

        {/* Logo real centrado */}
        <div className="flex flex-col items-center gap-3">
          <img
            src="https://veterinariamemo.com/wp-content/uploads/2023/02/SINFONDO-1024x1024.png"
            alt="Veterinaria Memo"
            className="w-40 h-40 object-contain drop-shadow-lg"
          />
          <span className="text-white font-display text-2xl font-semibold">Veterinaria Memo</span>
        </div>

        <div className="text-center">
          <h1 className="text-white font-display text-5xl font-bold leading-tight mb-6">
            Panel de<br />Administración
          </h1>
          <p className="text-white/70 text-lg max-w-sm">
            Gestiona citas, mascotas, propietarios y servicios desde un solo lugar.
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
            <img
              src="https://veterinariamemo.com/wp-content/uploads/2023/02/SINFONDO-1024x1024.png"
              alt="Veterinaria Memo"
              className="w-10 h-10 rounded-xl object-contain"
            />
            <span className="font-display text-xl font-semibold" style={{ color: '#003B6E' }}>
              Veterinaria Memo
            </span>
          </div>

          <h2 className="font-display text-3xl font-bold text-slate-800 mb-2">Bienvenido</h2>
          <p className="text-slate-500 mb-8">Inicia sesión para continuar</p>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                style={{ '--tw-ring-color': '#00A99D' } as any}
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
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
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
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>

            <p className="text-center text-sm text-slate-500">
              ¿No tienes cuenta?{' '}
              <a href="/register" className="font-semibold" style={{ color: '#00A99D' }}>
                Regístrate aquí
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}