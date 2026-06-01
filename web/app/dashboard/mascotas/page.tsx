'use client';
import { useEffect, useState } from 'react';
import { getMascotas, deleteMascota, updateMascota } from '@/lib/api';
import { PawPrint, Search, Trash2, Edit2, X, Check } from 'lucide-react';

interface Mascota {
  id: string; nombre: string; especie: string; raza: string;
  edad: string | number; historial_medico: string; foto: string | null;
  propietario_nombre: string; propietario_email: string;
}

const emptyForm = { nombre: '', especie: '', raza: '', edad: '', historial_medico: '' };

export default function MascotasPage() {
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editingMascota, setEditingMascota] = useState<Mascota | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMascotas().then(res => {
      setMascotas(res.data || []);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteMascota(id);
      setMascotas(prev => prev.filter(m => m.id !== id));
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  const startEdit = (mascota: Mascota) => {
    setEditingMascota(mascota);
    setForm({
      nombre: mascota.nombre,
      especie: mascota.especie,
      raza: mascota.raza,
      edad: String(mascota.edad),
      historial_medico: mascota.historial_medico || '',
    });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMascota) return;
    setSaving(true);
    try {
      await updateMascota(editingMascota.id, {
        nombre: form.nombre,
        especie: form.especie,
        raza: form.raza,
        edad: Number(form.edad),
        historial_medico: form.historial_medico,
      });
      setMascotas(prev => prev.map(m =>
        m.id === editingMascota.id ? { ...m, ...form, edad: Number(form.edad) } : m
      ));
      setEditingMascota(null);
    } finally {
      setSaving(false);
    }
  };

  const filtradas = mascotas.filter(m => {
    const q = busqueda.toLowerCase();
    return !q || m.nombre?.toLowerCase().includes(q) ||
      m.especie?.toLowerCase().includes(q) || m.raza?.toLowerCase().includes(q) ||
      m.propietario_nombre?.toLowerCase().includes(q);
  });

  const especieEmoji: Record<string, string> = {
    perro: '🐕', gato: '🐈', conejo: '🐇', ave: '🦜', pez: '🐠', reptil: '🦎',
  };

  const ESPECIES = ['Perro', 'Gato', 'Ave', 'Conejo', 'Reptil', 'Otro'];

  return (
    <div className="p-8 page-enter">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-800">Mascotas</h1>
        <p className="text-slate-500 mt-1">{mascotas.length} mascotas registradas</p>
      </div>

      {/* Modal editar */}
      {editingMascota && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">Editar mascota</h2>
              <button onClick={() => setEditingMascota(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre</label>
                <input type="text" required value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Especie</label>
                <select value={form.especie}
                  onChange={e => setForm(f => ({ ...f, especie: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 text-sm">
                  {ESPECIES.map(esp => <option key={esp} value={esp}>{esp}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Raza</label>
                <input type="text" required value={form.raza}
                  onChange={e => setForm(f => ({ ...f, raza: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Edad (años)</label>
                <input type="number" min={0} required value={form.edad}
                  onChange={e => setForm(f => ({ ...f, edad: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Historial médico</label>
                <textarea value={form.historial_medico} rows={3}
                  onChange={e => setForm(f => ({ ...f, historial_medico: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 text-sm resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingMascota(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-50"
                  style={{ background: '#00A99D' }}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, especie, propietario..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 text-sm"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-slate-200 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtradas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center">
          <PawPrint className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400">No se encontraron mascotas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtradas.map(mascota => (
            <div key={mascota.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden"
                  style={{ background: '#E6F7F6' }}>
                  {mascota.foto
                    ? <img src={mascota.foto} alt={mascota.nombre} className="w-full h-full object-cover" />
                    : (especieEmoji[mascota.especie?.toLowerCase()] || '🐾')
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 truncate">{mascota.nombre}</h3>
                  <p className="text-sm text-slate-400 capitalize">{mascota.especie} · {mascota.raza}</p>
                  <p className="text-xs text-slate-400">{mascota.edad} años</p>
                </div>
              </div>

              <div className="px-5 pb-4 border-t border-slate-50 pt-3">
                <p className="text-xs text-slate-400 mb-0.5">Propietario</p>
                <p className="text-sm font-medium text-slate-700 truncate">{mascota.propietario_nombre}</p>
                <p className="text-xs text-slate-400 truncate">{mascota.propietario_email}</p>
              </div>

              {mascota.historial_medico && (
                <div className="px-5 pb-4">
                  <p className="text-xs text-slate-400 mb-0.5">Historial médico</p>
                  <p className="text-sm text-slate-600 line-clamp-2">{mascota.historial_medico}</p>
                </div>
              )}

              <div className="px-5 pb-5 flex gap-2">
                {confirmDelete === mascota.id ? (
                  <div className="flex gap-2 w-full">
                    <p className="text-xs text-red-600 flex-1 flex items-center">¿Eliminar?</p>
                    <button onClick={() => handleDelete(mascota.id)} disabled={deletingId === mascota.id}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50">
                      <Check className="w-3 h-3" /> Sí
                    </button>
                    <button onClick={() => setConfirmDelete(null)}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                      <X className="w-3 h-3" /> No
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 ml-auto">
                    <button onClick={() => startEdit(mascota)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-white transition-colors"
                      style={{ background: '#00A99D' }}>
                      <Edit2 className="w-3 h-3" /> Editar
                    </button>
                    <button onClick={() => setConfirmDelete(mascota.id)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-red-500 border border-red-100 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3 h-3" /> Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}