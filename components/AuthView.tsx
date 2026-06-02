'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { motion, AnimatePresence } from 'motion/react';
import { login, registerUser } from '@/lib/actions';
import { Car, Lock, Mail, User as UserIcon, CheckCircle2, AlertCircle } from 'lucide-react';

export function AuthView() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<boolean>(false);

  // Form Fields for Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Form Fields for Register
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regTipo, setRegTipo] = useState<'Docente' | 'Técnico'>('Docente');
  const [regMatricula, setRegMatricula] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setErrorMsg('Por favor, preencha todos os campos do formulário.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    
    try {
      const res = await login(loginEmail, loginPassword);
      if (res && 'error' in res) {
        setErrorMsg(res.error || 'Erro desconhecido');
      }
    } catch (err) {
      setErrorMsg('Erro inesperado ao efetuar o login.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regMatricula || !regPassword) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await registerUser({
        name: regName,
        email: regEmail,
        tipo: regTipo,
        matricula: regMatricula,
        password: regPassword,
      });

      if (res && 'error' in res) {
        setErrorMsg(res.error || 'Erro desconhecido');
      } else {
        setSuccessMsg(true);
        // Clean fields
        setRegName('');
        setRegEmail('');
        setRegMatricula('');
        setRegPassword('');
      }
    } catch (err) {
      setErrorMsg('Erro inesperado ao enviar solicitação.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/95 p-4 z-50 overflow-y-auto">
      {/* Decorative colored lights */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-8 my-8 shrink-0 flex flex-col justify-center"
      >
        {/* LOGO */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 mb-3">
            <Car className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">S.A.V.</h1>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest leading-none mt-1">
            Gestão & Agendamento de Frota
          </p>
        </div>

        <AnimatePresence mode="wait">
          {successMsg ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-6"
            >
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
              <h2 className="text-xl font-bold text-slate-850 leading-tight">
                Solicitação Realizada!
              </h2>
              <p className="text-sm text-slate-600 mt-3 px-2 leading-relaxed">
                Seu cadastro de perfil de acesso foi registrado com sucesso. Sua solicitação passará pelo crivo do <strong>administrador</strong> para aprovação física e liberação do acesso.
              </p>
              
              <div className="mt-8 border-t border-slate-100 pt-6">
                <Button
                  onClick={() => {
                    setSuccessMsg(false);
                    setIsLogin(true);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  Voltar para o Login
                </Button>
              </div>
            </motion.div>
          ) : isLogin ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-800">Seja bem-vindo</h2>
                <p className="text-sm text-slate-500">Insira suas credenciais para gerenciar agendamentos.</p>
              </div>

              {errorMsg && (
                <div className="p-3 mb-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-lg flex items-start gap-2.5 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-medium whitespace-pre-line">{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    E-mail Institucional
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                    <Input
                      type="email"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      placeholder="seu-email@instituicao.edu.br"
                      className="pl-10 text-sm focus:ring-blue-500 focus:border-blue-500 border-slate-200"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Senha de Acesso
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                    <Input
                      type="password"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="Digite sua senha"
                      className="pl-10 text-sm focus:ring-blue-500 focus:border-blue-500 border-slate-200"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2.5 h-10 shadow-md shadow-blue-500/10 cursor-pointer mt-2"
                  disabled={loading}
                >
                  {loading ? 'Identificando...' : 'Acessar Conta'}
                </Button>
              </form>

              <div className="text-center mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(false);
                    setErrorMsg(null);
                  }}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Não está cadastrado? Solicitar cadastro de acesso
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-800">Solicitar Cadastro</h2>
                <p className="text-xs text-slate-500">Informe seus dados. Os perfis de acesso são regulados pelo admin.</p>
              </div>

              {errorMsg && (
                <div className="p-3 mb-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-lg flex items-start gap-2.5 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-medium">{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                    <Input
                      type="text"
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      placeholder="Insira seu nome completo"
                      className="pl-10 text-sm border-slate-200"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    E-mail Institucional
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                    <Input
                      type="email"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      placeholder="seu-email@instituicao.edu.br"
                      className="pl-10 text-sm border-slate-200"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Vínculo / Categoria
                    </label>
                    <Select
                      value={regTipo}
                      onChange={e => setRegTipo(e.target.value as 'Docente' | 'Técnico')}
                      className="text-sm bg-white border-slate-200 cursor-pointer h-10 font-medium"
                    >
                      <option value="Docente">Docente</option>
                      <option value="Técnico">Técnico</option>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Matrícula
                    </label>
                    <Input
                      type="text"
                      value={regMatricula}
                      onChange={e => setRegMatricula(e.target.value)}
                      placeholder="Nº da Matrícula"
                      className="text-sm border-slate-200"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Definir Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                    <Input
                      type="password"
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="Crie uma senha de acesso"
                      className="pl-10 text-sm border-slate-200"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2.5 h-10 shadow-md shadow-blue-500/10 cursor-pointer mt-2"
                  disabled={loading}
                >
                  {loading ? 'Processando envio...' : 'Enviar Solicitação'}
                </Button>
              </form>

              <div className="text-center mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(true);
                    setErrorMsg(null);
                  }}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Já tem uma conta cadastrada? Entrar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
