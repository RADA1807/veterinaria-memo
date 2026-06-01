'use client';
import { useEffect, useState } from 'react';
import { getCitas, getMascotas, getPropietarios } from '@/lib/api';
import { Calendar, PawPrint, Users, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface Cita {
  id: string; fecha: string; hora: string; motivo: string; servicio: string;
  estado: string; mascota_nombre: string; propietario_nombre: string;
}

export default function DashboardPage() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [totalMascotas, setTotalMascotas] = useState(0);
  const [totalPropietarios, setTotalPropietarios] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCitas(), getMascotas(), getPropietarios()])
      .then(([c, m, p]) => {
        setCitas(c.data || []);
        setTotalMascotas(m.data?.length || 0);
        setTotalPropietarios(p.data?.length || 0);
      })
      .finally(() => setLoading(false));
  }, []);

  const pendientes = citas.filter(c => c.estado === 'pendiente').length;
  const confirmadas = citas.filter(c => c.estado === 'confirmada').length;
  const completadas = citas.filter(c => c.estado === 'completada').length;
  const canceladas = citas.filter(c => c.estado === 'cancelada').length;
  const citasHoy = citas.filter(c => {
    try {
      const fechaStr = c.fecha?.toString().split('T')[0];
      const hoy = new Date().toISOString().split('T')[0];
      return fechaStr === hoy;
    } catch { return false; }
  });

  const stats = [
    { label: 'Total Citas', value: citas.length, icon: Calendar, color: '#00A99D', bg: '#E6F7F6' },
    { label: 'Mascotas', value: totalMascotas, icon: PawPrint, color: '#003B6E', bg: '#E8F0F8' },
    { label: 'Propietarios', value: totalPropietarios, icon: Users, color: '#F5A623', bg: '#FEF3E2' },
    { label: 'Citas Hoy', value: citasHoy.length, icon: Clock, color: '#8B5CF6', bg: '#F3F0FF' },
  ];

  const statusCards = [
    { label: 'Pendientes', value: pendientes, icon: AlertCircle, color: '#D97706', bg: '#FEF3E2' },
    { label: 'Confirmadas', value: confirmadas, icon: CheckCircle, color: '#2563EB', bg: '#EFF6FF' },
    { label: 'Completadas', value: completadas, icon: CheckCircle, color: '#16A34A', bg: '#F0FDF4' },
    { label: 'Canceladas', value: canceladas, icon: XCircle, color: '#DC2626', bg: '#FFF5F5' },
  ];

  if (loading) {
    return (
      <div className="p-8">
        <div className="h-8 bg-slate-200 rounded w-48 mb-8 animate-pulse" />
        <div className="grid grid-cols-4 gap-5 mb-8">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-200 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 page-enter">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">
          {format(new Date(), "EEEE, d 'de' MMMM yyyy", { locale: es })}
        </p>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-slate-500 font-medium">{label}</span>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-800">{value}</p>
          </div>
        ))}
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statusCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-xl px-4 py-3 flex items-center gap-3" style={{ background: bg }}>
            <Icon className="w-5 h-5 flex-shrink-0" style={{ color }} />
            <div>
              <p className="text-xs font-medium" style={{ color }}>{label}</p>
              <p className="text-xl font-bold text-slate-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Citas de hoy */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Citas de Hoy</h2>
          <span className="text-sm text-slate-400">{citasHoy.length} cita{citasHoy.length !== 1 ? 's' : ''}</span>
        </div>
        {citasHoy.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-400">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No hay citas programadas para hoy</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {citasHoy.map((cita) => (
              <div key={cita.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                <div className="text-center min-w-[48px]">
                  <p className="text-lg font-bold text-slate-800">{cita.hora?.slice(0, 5)}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">{cita.mascota_nombre}</p>
                  <p className="text-sm text-slate-400 truncate">{cita.propietario_nombre} · {cita.servicio}</p>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full badge-${cita.estado}`}>
                  {cita.estado}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
