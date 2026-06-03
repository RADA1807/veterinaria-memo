'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/lib/auth';
import {
  LayoutDashboard, Calendar, PawPrint, Users, Stethoscope, LogOut, UserPlus
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/citas', label: 'Citas', icon: Calendar },
  { href: '/dashboard/mascotas', label: 'Mascotas', icon: PawPrint },
  { href: '/dashboard/propietarios', label: 'Propietarios', icon: Users },
  { href: '/dashboard/servicios', label: 'Servicios', icon: Stethoscope },
  { href: '/dashboard/tratamientos', label: 'Tratamientos', icon: Stethoscope },
  { href: '/dashboard/invitaciones', label: 'Invitaciones', icon: UserPlus },
];

import { getUsuario } from '@/lib/auth';

export default function Sidebar() {
  const pathname = usePathname();
  const usuario = getUsuario();

  return (
    <aside className="w-64 min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #003B6E 0%, #005fa3 50%, #00A99D 100%)' }}>

      {/* Logo */}
      <div className="p-6 border-b border-white/10 flex flex-col items-center gap-2">
        <img
          src="https://veterinariamemo.com/wp-content/uploads/2023/02/SINFONDO-1024x1024.png"
          alt="Veterinaria Memo"
          className="w-36 h-36 object-contain drop-shadow-lg"
        />
        <p className="text-white font-display font-bold text-sm text-center leading-tight">
          Veterinaria Memo
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
              style={active
                ? { background: '#00A99D', color: '#ffffff' }
                : { color: 'rgba(255,255,255,0.7)' }
              }
            >
              <Icon style={{ width: 18, height: 18 }} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        {usuario && (
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ background: '#F5A623' }}>
              {usuario.email?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">{usuario.email}</p>
              <p className="text-xs capitalize" style={{ color: 'rgba(255,255,255,0.5)' }}>{usuario.rol}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all w-full"
          style={{ color: 'rgba(255,255,255,0.7)' }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <LogOut style={{ width: 18, height: 18 }} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}