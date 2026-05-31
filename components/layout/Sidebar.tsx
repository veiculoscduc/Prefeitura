'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Calendar, List, Users, Car, Menu, LogOut, Database, X, Key } from 'lucide-react';
import { User } from '@/lib/types';
import { logout, changePassword } from '@/lib/actions';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  currentUser: User;
}

export function Sidebar({ currentUser }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const [changePasswordOpen, setChangePasswordOpen] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmNewPassword, setConfirmNewPassword] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');
  const [passwordSuccess, setPasswordSuccess] = React.useState('');
  const [loadingPassword, setLoadingPassword] = React.useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('Digite a sua senha atual.');
      return;
    }
    if (newPassword.length < 4) {
      setPasswordError('A nova senha deve ter no mínimo 4 caracteres.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('A confirmação da nova senha está diferente.');
      return;
    }

    setLoadingPassword(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res?.error) {
        setPasswordError(res.error);
      } else {
        setPasswordSuccess('Senha alterada com sucesso!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setTimeout(() => {
          setChangePasswordOpen(false);
          setPasswordSuccess('');
        }, 1500);
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Ocorreu um erro ao atualizar a senha.');
    } finally {
      setLoadingPassword(false);
    }
  };

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
    <>
      {/* Desktop Sidebar */}
      <aside
        id="desktop-sidebar"
        className={cn(
          "bg-slate-900 flex-shrink-0 flex flex-col transition-all duration-300 h-full hidden md:flex",
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
                <>
                  <p className="text-[10px] text-blue-400 uppercase mt-0.5 font-semibold tracking-wider font-mono">
                    {currentUser.role} {currentUser.tipo ? `/ ${currentUser.tipo}` : ''}
                  </p>
                  <button 
                    id="btn-desktop-change-password"
                    onClick={() => {
                      setPasswordError('');
                      setPasswordSuccess('');
                      setChangePasswordOpen(true);
                    }}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer mt-2"
                  >
                    <Key className="w-3.5 h-3.5 text-slate-550" />
                    <span>Trocar Senha</span>
                  </button>
                </>
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

      {/* Mobile Topbar and Header */}
      <header
        id="mobile-header"
        className="flex md:hidden h-14 bg-slate-900 text-white items-center justify-between px-4 w-full z-40 shrink-0 border-b border-slate-800"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 shrink-0 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm">V</div>
          <span className="text-white font-semibold tracking-wide text-sm">S.A.V. Inst</span>
        </div>
        <button 
          id="mobile-menu-toggle"
          onClick={() => setMobileOpen(true)} 
          className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 shrink-0 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              id="mobile-menu-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 md:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              id="mobile-menu-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-slate-900 text-white z-50 md:hidden flex flex-col border-r border-slate-800 shadow-2xl h-full"
            >
              <div className="p-4 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 shrink-0 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm">V</div>
                  <span className="text-white font-semibold tracking-wide text-sm">S.A.V. Inst</span>
                </div>
                <button
                  id="close-mobile-menu"
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 py-4 overflow-y-auto px-2">
                <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Navegação</div>
                <nav className="space-y-1">
                  {links.map((link) => (
                    <Link
                      id={`mobile-nav-${link.href.replace('/', 'home')}`}
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center px-4 py-3 rounded-lg transition-colors text-sm",
                        pathname === link.href
                          ? "bg-blue-600/10 text-blue-400 font-medium"
                          : "text-slate-400 hover:bg-slate-800 hover:text-white"
                      )}
                    >
                      <link.icon className="shrink-0 w-5 h-5 mr-3" />
                      <span>{link.name}</span>
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="p-4 shrink-0 border-t border-slate-800 bg-slate-950/40">
                <div className="bg-slate-800/80 rounded-lg p-4 flex flex-col gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 mb-0.5">Usuário Logado</p>
                    <p className="text-sm text-white font-medium truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-blue-400 uppercase mt-0.5 font-semibold tracking-wider font-mono">
                      {currentUser.role} {currentUser.tipo ? `/ ${currentUser.tipo}` : ''}
                    </p>
                    <button 
                      id="btn-mobile-change-password"
                      onClick={() => {
                        setPasswordError('');
                        setPasswordSuccess('');
                        setChangePasswordOpen(true);
                        setMobileOpen(false);
                      }}
                      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer mt-2"
                    >
                      <Key className="w-3.5 h-3.5 text-slate-550" />
                      <span>Trocar Senha</span>
                    </button>
                  </div>
                  <button
                    id="mobile-logout-btn"
                    onClick={async () => {
                      setMobileOpen(false);
                      await logout();
                    }}
                    className="flex items-center justify-center gap-2 w-full text-xs font-semibold text-rose-400 hover:text-white bg-slate-900 hover:bg-rose-600/25 border border-slate-700 hover:border-rose-500/40 p-2.5 rounded-md transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair do Sistema</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modern Change Password Modal Dialog */}
      <AnimatePresence>
        {changePasswordOpen && (
          <div id="change-password-modal-container" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              id="change-password-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setChangePasswordOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            />
            <motion.div
              id="change-password-dialog"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.15 }}
              className="relative bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200 z-10"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-800 text-base">Trocar de Senha</h3>
                </div>
                <button
                  id="close-password-modal"
                  onClick={() => setChangePasswordOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handlePasswordChange} className="p-5 space-y-4">
                {passwordError && (
                  <div className="bg-rose-50 text-rose-600 border border-rose-100 p-2.5 rounded text-xs font-medium">
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 p-2.5 rounded text-xs font-medium">
                    {passwordSuccess}
                  </div>
                )}

                <div className="space-y-1">
                  <label htmlFor="currentPass" className="block text-xs font-semibold text-slate-550">
                    Senha Atual
                  </label>
                  <input
                    id="currentPass"
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Sua senha atual"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="newPass" className="block text-xs font-semibold text-slate-550">
                    Nova Senha
                  </label>
                  <input
                    id="newPass"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Mínimo 4 caracteres"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="confirmNewPass" className="block text-xs font-semibold text-slate-550">
                    Confirmar Nova Senha
                  </label>
                  <input
                    id="confirmNewPass"
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Repita a nova senha"
                  />
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-100 mt-4">
                  <button
                    id="btn-cancel-password"
                    type="button"
                    onClick={() => setChangePasswordOpen(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold py-2 rounded transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    id="btn-submit-password"
                    type="submit"
                    disabled={loadingPassword}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold py-2 rounded transition-colors flex items-center justify-center cursor-pointer"
                  >
                    {loadingPassword ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
