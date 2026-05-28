'use client';
import { useState } from 'react';
import { generarInvitacion } from '@/lib/api';
import { Copy, Check, UserPlus } from 'lucide-react';

export default function InvitacionesPage() {
  const [codigo, setCodigo] = useState('');
  const [expira, setExpira] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [error, setError] = useState('');

  const handleGenerar = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await generarInvitacion();
      setCodigo(res.data.codigo);
      setExpira(res.data.expira);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al generar invitación');
    } finally {
      setLoading(false);
    }
  };

  const handleCopiar = () => {
    navigator.clipboard.writeText(codigo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="p-8 page-enter">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-800">Invitaciones</h1>
        <p className="text-slate-500 mt-1">Genera códigos para registrar nuevos administradores</p>
      </div>

      <div className="max-w-lg">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#E6F7F6' }}>
              <UserPlus className="w-6 h-6" style={{ color: '#00A99D' }} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">Invitar administrador</h2>
              <p className="text-sm text-slate-400">El código expira en 24 horas</p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm mb-4">
              <span>⚠️</span> {error}
            </div>
          )}

          {codigo && (
            <div className="mb-6">
              <p className="text-sm font-medium text-slate-700 mb-2">Código generado:</p>
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-4 border border-slate-200">
                <p className="font-mono text-2xl font-bold tracking-widest flex-1" style={{ color: '#003B6E' }}>
                  {codigo}
                </p>
                <button
                  onClick={handleCopiar}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white transition-all"
                  style={{ background: copiado ? '#28A745' : '#00A99D' }}
                >
                  {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiado ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                ⏰ Expira: {new Date(expira).toLocaleString('es-CR')}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Comparte este código con la persona que quieres registrar como administrador.
              </p>
            </div>
          )}

          <button
            onClick={handleGenerar}
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-white font-semibold text-base transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #00A99D, #008C82)' }}
          >
            {loading ? 'Generando...' : codigo ? 'Generar nuevo código' : 'Generar código de invitación'}
          </button>
        </div>
      </div>
    </div>
  );
}