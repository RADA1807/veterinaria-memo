'use client';
import { useEffect, useState } from 'react';
import { getCitas, updateEstadoCita } from '@/lib/api';
import { Calendar, Search, MessageSquare, X } from 'lucide-react';

interface Cita {
  id: string; fecha: string; hora: string; motivo: string; servicio: string;
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
  mascota_nombre: string; especie: string;
  propietario_nombre: string; propietario_email: string; propietario_telefono: string;
  nota_admin?: string;
}

const ESTADOS = ['todos', 'pendiente', 'confirmada', 'completada', 'cancelada'];

const estadoColors: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  confirmada: 'bg-blue-100 text-blue-800',
  completada: 'bg-green-100 text-green-800',
  cancelada: 'bg-red-100 text-red-800',
};

const nextEstado: Record<string, { label: string; value: string; color: string }[]> = {
  pendiente: [{ label: 'Confirmar', value: 'confirmada', color: '#2563EB' }, { label: 'Cancelar', value: 'cancelada', color: '#DC2626' }],
  confirmada: [{ label: 'Completar', value: 'completada', color: '#16A34A' }, { label: 'Cancelar', value: 'cancelada', color: '#DC2626' }],
  completada: [],
  cancelada: [],
};

export default function CitasPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [modalNota, setModalNota] = useState<{ id: string; estado: string; label: string } | null>(null);
  const [nota, setNota] = useState('');

  const fetchCitas = async () => {
    const res = await getCitas();
    setCitas(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
  fetchCitas();
  const interval = setInterval(() => {
    fetchCitas();
  }, 10000);
  return () => clearInterval(interval);
}, []);

  const handleEstadoClick = (id: string, estado: string, label: string) => {
    if (estado === 'confirmada') {
      setModalNota({ id, estado, label });
      setNota('');
    } else {
      handleEstado(id, estado, '');
    }
  };

  const handleEstado = async (id: string, estado: string, nota_admin: string) => {
    setUpdating(id);
    setModalNota(null);
    try {
      await updateEstadoCita(id, estado, nota_admin);
      setCitas(prev => prev.map(c => c.id === id ? { ...c, estado: estado as any, nota_admin } : c));
    } finally {
      setUpdating(null);
    }
  };

  const filtradas = citas.filter(c => {
    const matchEstado = filtroEstado === 'todos' || c.estado === filtroEstado;
    const q = busqueda.toLowerCase();
    const matchBusqueda = !q || c.mascota_nombre?.toLowerCase().includes(q) ||
      c.propietario_nombre?.toLowerCase().includes(q) || c.servicio?.toLowerCase().includes(q);
    return matchEstado && matchBusqueda;
  });

  return (
    <>
      {/* Modal nota */}
      {modalNota && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">Confirmar cita</h2>
              <button onClick={() => setModalNota(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nota para el propietario (opcional)
                </label>
                <textarea
                  value={nota}
                  onChange={e => setNota(e.target.value)}
                  rows={3}
                  placeholder="Ej: El precio del Grooming es ₡18,000 por el tamaño de su mascota..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 text-sm resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setModalNota(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50">
                  Cancelar
                </button>
                <button
                  onClick={() => handleEstado(modalNota.id, modalNota.estado, nota)}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium"
                  style={{ background: '#2563EB' }}>
                  Confirmar cita
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-8 page-enter">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-slate-800">Citas</h1>
          <p className="text-slate-500 mt-1">{citas.length} citas en total</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por mascota, propietario o servicio..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 text-sm"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {ESTADOS.map(estado => (
              <button
                key={estado}
                onClick={() => setFiltroEstado(estado)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${filtroEstado === estado
                  ? 'text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
                style={filtroEstado === estado ? { background: '#00A99D' } : {}}
              >
                {estado}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-slate-200 rounded-xl animate-pulse" />)}
          </div>
        ) : filtradas.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center">
            <Calendar className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-400">No se encontraron citas</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {['Fecha / Hora', 'Mascota', 'Propietario', 'Servicio', 'Estado', 'Acciones'].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtradas.map(cita => (
                    <tr key={cita.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800 text-sm">
                          {(() => {
                            try {
                              const [year, month, day] = cita.fecha.toString().split('T')[0].split('-');
                              return `${day} ${['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'][parseInt(month) - 1]} ${year}`;
                            } catch { return cita.fecha; }
                          })()}
                        </p>
                        <p className="text-slate-400 text-xs">{cita.hora?.slice(0, 5)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800 text-sm">{cita.mascota_nombre}</p>
                        <p className="text-slate-400 text-xs capitalize">{cita.especie}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-slate-800 text-sm">{cita.propietario_nombre}</p>
                        <p className="text-slate-400 text-xs">{cita.propietario_telefono}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-slate-700 text-sm">{cita.servicio}</p>
                        <p className="text-slate-400 text-xs truncate max-w-[160px]">{cita.motivo}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${estadoColors[cita.estado]}`}>
                            {cita.estado}
                          </span>
                          {cita.nota_admin && (
                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" /> Nota enviada
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          {(nextEstado[cita.estado] || []).map(({ label, value, color }) => (
                            <button
                              key={value}
                              onClick={() => handleEstadoClick(cita.id, value, label)}
                              disabled={updating === cita.id}
                              className="text-xs px-3 py-1.5 rounded-lg font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                              style={{ background: color }}
                            >
                              {updating === cita.id ? '...' : label}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}