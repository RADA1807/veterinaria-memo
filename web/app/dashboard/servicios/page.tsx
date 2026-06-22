'use client';
import { useEffect, useState } from 'react';
import { getServicios, createServicio, updateServicio, deleteServicio } from '@/lib/api';
import { Stethoscope, Plus, Edit2, Trash2, X, Check, Scissors, SmilePlus, Droplets, Leaf, ShoppingBag, Radiation, Activity } from 'lucide-react';

interface Servicio {
  id: string; nombre: string; descripcion: string;
  duracion_minutos: number; precio: number; activo: boolean;
}

const emptyForm = { nombre: '', descripcion: '', duracion_minutos: 30, precio: 0 };

export default function ServiciosPage() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchServicios = async () => {
    const res = await getServicios();
    setServicios(res.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchServicios(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateServicio(editingId, { ...form, activo: true });
        setServicios(prev => prev.map(s => s.id === editingId ? { ...s, ...form } : s));
      } else {
        await createServicio(form);
        await fetchServicios();
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (s: Servicio) => {
    setForm({ nombre: s.nombre, descripcion: s.descripcion, duracion_minutos: s.duracion_minutos, precio: s.precio });
    setEditingId(s.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await deleteServicio(id);
    setServicios(prev => prev.filter(s => s.id !== id));
    setConfirmDelete(null);
  };

 const getServicioIcon = (nombre: string) => {
  const n = nombre.toLowerCase();
  if (n.includes('farmacia')) return <ShoppingBag className="w-5 h-5" style={{ color: '#00A99D' }} />;
  if (n.includes('grooming')) return <Scissors className="w-5 h-5" style={{ color: '#00A99D' }} />;
  if (n.includes('dental')) return <SmilePlus className="w-5 h-5" style={{ color: '#00A99D' }} />;
 if (n.includes('rayos')) return <Radiation className="w-5 h-5" style={{ color: '#00A99D' }} />;
if (n.includes('ultrasonido')) return <Activity className="w-5 h-5" style={{ color: '#00A99D' }} />;
  if (n.includes('hemograma')) return <Droplets className="w-5 h-5" style={{ color: '#00A99D' }} />;
  if (n.includes('nutrici')) return <Leaf className="w-5 h-5" style={{ color: '#00A99D' }} />;
  return <Stethoscope className="w-5 h-5" style={{ color: '#00A99D' }} />;
};

  return (
    <div className="p-8 page-enter">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-800">Servicios</h1>
          <p className="text-slate-500 mt-1">{servicios.length} servicios disponibles</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium text-sm transition-opacity hover:opacity-90"
          style={{ background: '#00A99D' }}
        >
          <Plus className="w-4 h-4" />
          Nuevo servicio
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">
                {editingId ? 'Editar servicio' : 'Nuevo servicio'}
              </h2>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre *</label>
                <input
                  type="text" required value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 text-sm"
                  placeholder="Consulta veterinaria"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 text-sm resize-none"
                  placeholder="Descripción del servicio..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Duración (min)</label>
                  <input
                    type="number" min={5} value={form.duracion_minutos}
                    onChange={e => setForm(f => ({ ...f, duracion_minutos: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Precio (₡)</label>
                  <input
                    type="number" min={0} value={form.precio}
                    onChange={e => setForm(f => ({ ...f, precio: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                  style={{ background: '#00A99D' }}>
                  {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="h-40 bg-slate-200 rounded-2xl animate-pulse" />)}
        </div>
      ) : servicios.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center">
          <Stethoscope className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400">No hay servicios registrados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {servicios.map(s => (
            <div key={s.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#E6F7F6' }}>
                  {getServicioIcon(s.nombre)}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(s)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {confirmDelete === s.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => handleDelete(s.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setConfirmDelete(null)}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(s.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <h3 className="font-semibold text-slate-800 mb-1">{s.nombre}</h3>
              {s.descripcion && <p className="text-sm text-slate-400 mb-3 line-clamp-2">{s.descripcion}</p>}

              <div className="flex gap-4 mt-auto">
                <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: '#00A99D' }}>
                  ₡{s.precio?.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
