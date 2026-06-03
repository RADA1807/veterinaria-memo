'use client';
import { useEffect, useState } from 'react';
import { getTratamientos, createTratamiento, deleteTratamiento, getMascotas } from '@/lib/api';
import { Stethoscope, Plus, Trash2, X, Check, Clock, DollarSign } from 'lucide-react';

interface Tratamiento {
  id: number; tipo: string; descripcion: string; costo: number;
  fecha: string; veterinario: string;
  mascota_nombre: string; especie: string; propietario_nombre: string;
}

interface Mascota {
  id: string; nombre: string; especie: string;
  propietario_nombre: string;
}

const emptyForm = {
  paciente_id: '', tipo: '', descripcion: '',
  fecha: new Date().toISOString().split('T')[0],
  costo: 0, veterinario: ''
};

export default function TratamientosPage() {
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([]);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const fetchData = async () => {
    const [t, m] = await Promise.all([getTratamientos(), getMascotas()]);
    setTratamientos(t.data || []);
    setMascotas(m.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createTratamiento(form);
      await fetchData();
      setShowForm(false);
      setForm(emptyForm);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    await deleteTratamiento(String(id));
    setTratamientos(prev => prev.filter(t => t.id !== id));
    setConfirmDelete(null);
  };

  return (
    <div className="p-8 page-enter">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-800">Tratamientos</h1>
          <p className="text-slate-500 mt-1">{tratamientos.length} tratamientos registrados</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium text-sm transition-opacity hover:opacity-90"
          style={{ background: '#00A99D' }}
        >
          <Plus className="w-4 h-4" />
          Nuevo tratamiento
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">Registrar tratamiento</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Mascota *</label>
                <select required value={form.paciente_id}
                  onChange={e => setForm(f => ({ ...f, paciente_id: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 text-sm">
                  <option value="">Selecciona una mascota</option>
                  {mascotas.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre} — {m.propietario_nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo de tratamiento *</label>
                <input type="text" required value={form.tipo}
                  onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                  placeholder="Ej: Vacunación, Cirugía, Consulta..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción</label>
                <textarea value={form.descripcion} rows={3}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Detalles del tratamiento..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 text-sm resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha *</label>
                  <input type="date" required value={form.fecha}
                    onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Costo (₡)</label>
                  <input type="number" min={0} value={form.costo}
                    onChange={e => setForm(f => ({ ...f, costo: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Veterinario</label>
                <input type="text" value={form.veterinario}
                  onChange={e => setForm(f => ({ ...f, veterinario: e.target.value }))}
                  placeholder="Nombre del veterinario"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 text-sm"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50"
                  style={{ background: '#00A99D' }}>
                  {saving ? 'Guardando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-slate-200 rounded-2xl animate-pulse" />)}
        </div>
      ) : tratamientos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center">
          <Stethoscope className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400">No hay tratamientos registrados</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Fecha', 'Mascota', 'Propietario', 'Tipo', 'Veterinario', 'Costo', 'Acciones'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tratamientos.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-800">{t.fecha?.toString().split('T')[0]}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-800">{t.mascota_nombre}</p>
                      <p className="text-xs text-slate-400 capitalize">{t.especie}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-slate-700">{t.propietario_nombre}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-800">{t.tipo}</p>
                      {t.descripcion && <p className="text-xs text-slate-400 truncate max-w-[160px]">{t.descripcion}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-slate-700">{t.veterinario || '—'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold" style={{ color: '#00A99D' }}>₡{t.costo?.toLocaleString()}</p>
                    </td>
                    <td className="px-5 py-4">
                      {confirmDelete === t.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleDelete(t.id)}
                            className="text-xs px-2 py-1 rounded-lg bg-red-500 text-white flex items-center gap-1">
                            <Check className="w-3 h-3" /> Sí
                          </button>
                          <button onClick={() => setConfirmDelete(null)}
                            className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-600 flex items-center gap-1">
                            <X className="w-3 h-3" /> No
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDelete(t.id)}
                          className="text-xs px-3 py-1.5 rounded-lg text-red-500 border border-red-100 hover:bg-red-50 transition-colors flex items-center gap-1">
                          <Trash2 className="w-3 h-3" /> Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}