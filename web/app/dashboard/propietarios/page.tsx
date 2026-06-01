'use client';
import { useEffect, useState } from 'react';
import { getPropietarios, getPropietario, deletePropietario } from '@/lib/api';
import { Users, Search, ChevronRight, X, Trash2, Check, Mail, Phone, PawPrint, Calendar, Edit2 } from 'lucide-react';
import api from '@/lib/api';

interface Propietario {
  id: string; nombre: string; correo: string; telefono: string; total_mascotas: number;
}

interface PropietarioDetalle extends Propietario {
  mascotas: { id: string; nombre: string; especie: string; raza: string; edad: number; foto?: string }[];
  citas: { id: string; fecha: string; hora: string; servicio: string; estado: string; mascota_nombre: string }[];
}

const estadoColors: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  confirmada: 'bg-blue-100 text-blue-800',
  completada: 'bg-green-100 text-green-800',
  cancelada: 'bg-red-100 text-red-800',
};

export default function PropietariosPage() {
  const [propietarios, setPropietarios] = useState<Propietario[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [selected, setSelected] = useState<PropietarioDetalle | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({ nombre: '', correo: '', telefono: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getPropietarios().then(res => {
      setPropietarios(res.data || []);
      setLoading(false);
    });
  }, []);

  const openDetail = async (id: string) => {
    setLoadingDetail(true);
    setEditando(false);
    const res = await getPropietario(id);
    setSelected(res.data);
    setLoadingDetail(false);
  };

  const startEdit = () => {
    if (!selected) return;
    setForm({
      nombre: selected.nombre,
      correo: selected.correo,
      telefono: selected.telefono || '',
    });
    setEditando(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    try {
      await api.put(`/api/propietarios/${selected.id}`, form);
      setSelected(prev => prev ? { ...prev, ...form } : null);
      setPropietarios(prev => prev.map(p =>
        p.id === selected.id ? { ...p, nombre: form.nombre, correo: form.correo, telefono: form.telefono } : p
      ));
      setEditando(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deletePropietario(id);
    setPropietarios(prev => prev.filter(p => p.id !== id));
    setSelected(null);
    setConfirmDelete(null);
  };

  const filtrados = propietarios.filter(p => {
    const q = busqueda.toLowerCase();
    return !q || p.nombre?.toLowerCase().includes(q) || p.correo?.toLowerCase().includes(q);
  });

  return (
    <div className="p-8 page-enter">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-800">Propietarios</h1>
        <p className="text-slate-500 mt-1">{propietarios.length} clientes registrados</p>
      </div>

      <div className="flex gap-6">
        {/* List */}
        <div className="flex-1 min-w-0">
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 text-sm"
            />
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-slate-200 rounded-xl animate-pulse" />)}
            </div>
          ) : filtrados.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center">
              <Users className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-400">No se encontraron propietarios</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
              {filtrados.map(p => (
                <button
                  key={p.id}
                  onClick={() => openDetail(p.id)}
                  className={`w-full px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left ${selected?.id === p.id ? 'bg-teal-50' : ''}`}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ background: '#00A99D' }}>
                    {p.nombre?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">{p.nombre}</p>
                    <p className="text-sm text-slate-400 truncate">{p.correo}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-slate-400">{p.total_mascotas} mascota{p.total_mascotas !== 1 ? 's' : ''}</span>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-start justify-between">
                <div>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mb-3"
                    style={{ background: '#00A99D' }}>
                    {selected.nombre?.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="font-semibold text-slate-800">{selected.nombre}</h3>
                </div>
                <div className="flex gap-2">
                  <button onClick={startEdit} className="text-slate-400 hover:text-teal-600 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Formulario de edición */}
              {editando ? (
                <form onSubmit={handleEdit} className="p-5 space-y-3 border-b border-slate-100">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Nombre</label>
                    <input type="text" required value={form.nombre}
                      onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Correo</label>
                    <input type="email" required value={form.correo}
                      onChange={e => setForm(f => ({ ...f, correo: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Teléfono</label>
                    <input type="tel" value={form.telefono}
                      onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 text-sm"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => setEditando(false)}
                      className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50">
                      Cancelar
                    </button>
                    <button type="submit" disabled={saving}
                      className="flex-1 py-2 rounded-lg text-white text-xs font-medium disabled:opacity-50"
                      style={{ background: '#00A99D' }}>
                      {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-5 space-y-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {selected.correo}
                  </div>
                  {selected.telefono && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400" />
                      {selected.telefono}
                    </div>
                  )}
                </div>
              )}

              {/* Mascotas */}
              <div className="p-5 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <PawPrint className="w-3.5 h-3.5" /> Mascotas ({selected.mascotas?.length || 0})
                </p>
                {selected.mascotas?.length === 0 ? (
                  <p className="text-sm text-slate-400">Sin mascotas</p>
                ) : (
                  <div className="space-y-2">
                    {selected.mascotas?.map(m => (
                      <div key={m.id} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center text-sm flex-shrink-0" style={{ background: '#E6F7F6' }}>
                          {m.foto
                            ? <img src={m.foto} alt={m.nombre} className="w-full h-full object-cover" />
                            : <span>{m.especie === 'Gato' ? '🐱' : m.especie === 'Ave' ? '🐦' : m.especie === 'Conejo' ? '🐰' : '🐶'}</span>
                          }
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">{m.nombre}</p>
                          <p className="text-xs text-slate-400 capitalize">{m.especie} · {m.raza}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Citas */}
              <div className="p-5 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Últimas citas
                </p>
                {selected.citas?.length === 0 ? (
                  <p className="text-sm text-slate-400">Sin citas</p>
                ) : (
                  <div className="space-y-2">
                    {selected.citas?.slice(0, 4).map(c => (
                      <div key={c.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-slate-700">{c.mascota_nombre} · {c.servicio}</p>
                          <p className="text-xs text-slate-400">{c.fecha?.slice(0, 10)}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${estadoColors[c.estado]}`}>
                          {c.estado}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Delete */}
              <div className="p-5">
                {confirmDelete === selected.id ? (
                  <div className="flex gap-2">
                    <p className="text-xs text-red-600 flex-1 flex items-center">¿Eliminar cliente?</p>
                    <button onClick={() => handleDelete(selected.id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-red-500 text-white flex items-center gap-1">
                      <Check className="w-3 h-3" /> Sí
                    </button>
                    <button onClick={() => setConfirmDelete(null)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 flex items-center gap-1">
                      <X className="w-3 h-3" /> No
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDelete(selected.id)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-red-500 border border-red-100 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-3 h-3" /> Eliminar propietario
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}