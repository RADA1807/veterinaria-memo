'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/lib/auth';
import {
  LayoutDashboard, Calendar, PawPrint, Users, Stethoscope, LogOut, UserPlus
} from 'lucide-react';

const navItems = [
  { href: '/dashboard',              label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/dashboard/citas',        label: 'Citas',         icon: Calendar },
  { href: '/dashboard/mascotas',     label: 'Mascotas',      icon: PawPrint },
  { href: '/dashboard/propietarios', label: 'Propietarios',  icon: Users },
  { href: '/dashboard/servicios',    label: 'Servicios',     icon: Stethoscope },
  { href: '/dashboard/invitaciones',      label: 'Invitaciones',  icon: UserPlus },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen flex flex-col" style={{ background: '#003B6E' }}>
      
      {/* Logo */}
      <div className="p-6 border-b border-white/10 flex flex-col items-center gap-2">
        <img
          src="https://veterinariamemo.com/wp-content/uploads/2023/02/SINFONDO-1024x1024.png"
          alt="Veterinaria Memo"
          className="w-20 h-20 object-contain drop-shadow-lg"
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
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
              style={active ? { background: '#00A99D' } : {}}
            >
              <Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all w-full"
        >
          <LogOut style={{ width: 18, height: 18 }} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}