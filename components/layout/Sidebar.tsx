'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Calendar, List, Users, Car, Menu, LogOut, Database } from 'lucide-react';
import { User } from '@/lib/types';
import { logout } from '@/lib/actions';

interface SidebarProps {
  currentUser: User;
}

export function Sidebar({ currentUser }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  const links = React.useMemo(() => {
    switch (currentUser.role) {
      case 'SOLICITANTE':
        return [
          { name: 'Agenda', href: '/', icon: Calendar },
          { name: 'Minhas Solicitações', href: '/solicitacoes', icon: List },
        ];
      case 'ADMIN':
        return [
          { name: 'Agenda', href: '/', icon: Calendar },
          { name: 'Solicitações', href: '/admin/solicitacoes', icon: List },
          { name: 'Bloqueios', href: '/admin/bloqueios', icon: Calendar },
          { name: 'Usuários', href: '/admin/usuarios', icon: Users },
          { name: 'Veículos', href: '/admin/veiculos', icon: Car },
        ];
      case 'MOTORISTA':
        return [
          { name: 'Corridas Confirmadas', href: '/', icon: List },
          { name: 'Minhas Corridas', href: '/motorista/corridas', icon: Car },
        ];
      default:
        return [];
    }
  }, [currentUser.role]);

  return (
    <aside
      className={cn(
        "bg-slate-900 flex-shrink-0 flex flex-col transition-all duration-300 h-full",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-6 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-8 h-8 shrink-0 bg-blue-600 rounded flex items-center justify-center text-white font-bold">V</div>
          {!collapsed && <span className="text-white font-semibold tracking-wide truncate">S.A.V. Inst</span>}
        </div>
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 shrink-0 ml-2">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 py-4 overflow-y-auto">
        {!collapsed && <div className="px-6 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Navegação</div>}
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            title={collapsed ? link.name : undefined}
            className={cn(
               "flex items-center px-6 py-3 transition-colors",
               pathname === link.href 
                 ? "bg-blue-600/10 text-blue-400 border-r-4 border-blue-500" 
                 : "text-slate-400 hover:bg-slate-800",
               collapsed && "justify-center px-0 border-transparent border-r-4"
            )}
          >
            <link.icon className={cn("shrink-0", collapsed ? "w-6 h-6" : "w-5 h-5", !collapsed && "mr-3")} />
            {!collapsed && <span>{link.name}</span>}
          </Link>
        ))}
      </div>

      <div className="p-6 shrink-0 border-t border-slate-800">
        <div className="bg-slate-800 rounded-lg p-4 flex flex-col gap-3">
          <div className="min-w-0">
            <p className="text-xs text-slate-400 mb-0.5">{!collapsed ? 'Usuário Logado' : 'User'}</p>
            <p className="text-sm text-white font-medium truncate">{currentUser.name}</p>
            {!collapsed && (
              <p className="text-[10px] text-blue-400 uppercase mt-0.5 font-semibold tracking-wider font-mono">
                {currentUser.role} {currentUser.tipo ? `/ ${currentUser.tipo}` : ''}
              </p>
            )}
          </div>
          <button
            onClick={async () => {
              await logout();
            }}
            className="flex items-center justify-center gap-2 w-full text-xs font-semibold text-rose-400 hover:text-white bg-slate-900 hover:bg-rose-600/25 border border-slate-700 hover:border-rose-500/40 p-2 rounded-md transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span>Sair do Sistema</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
