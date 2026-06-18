'use client';

import React, { useState, useEffect } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Database, Copy, Check, Terminal, ExternalLink, HelpCircle } from 'lucide-react';

export default function SupabaseIntegrationPage() {
  const [configured, setConfigured] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<'env' | 'schema' | 'seed' | 'migration' | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setConfigured(isSupabaseConfigured());
    }, 10);
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = (type: 'env' | 'schema' | 'seed' | 'migration', text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const envText = `# SUPABASE CONNECTION SETTINGS
NEXT_PUBLIC_SUPABASE_URL="https://your-supabase-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-role-public-key-here"`;

  const sqlSchemaText = `-- 1. TABELA DE USUÁRIOS
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'SOLICITANTE',
  tipo TEXT,
  matricula TEXT,
  password TEXT NOT NULL DEFAULT '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5',
  status TEXT NOT NULL DEFAULT 'PENDENTE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. TABELA DE VEÍCULOS
CREATE TABLE IF NOT EXISTS public.vehicles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  plate TEXT NOT NULL,
  quantidade_passageiros INTEGER NOT NULL DEFAULT 4,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. TABELA DE SOLICITAÇÕES / AGENDAMENTOS
CREATE TABLE IF NOT EXISTS public.requests (
  id TEXT PRIMARY KEY,
  solicitante_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'SOLICITADO',
  data_solicitacao TEXT NOT NULL,
  data_saida TEXT NOT NULL,
  hora_saida TEXT NOT NULL,
  data_retorno TEXT NOT NULL,
  hora_retorno TEXT NOT NULL,
  veiculos_ids TEXT[] NOT NULL DEFAULT '{}',
  motoristas_ids TEXT[] NOT NULL DEFAULT '{}',
  quantidade_passageiros INTEGER,
  vai_acompanhar BOOLEAN,
  nome_passageiro TEXT,
  vai_sair_campus BOOLEAN,
  endereco_saida TEXT,
  endereco_destino TEXT,
  horario_no_local TEXT,
  justificativa_rejeicao TEXT,
  km_saida INTEGER,
  km_retorno INTEGER,
  hora_saida_real TEXT,
  hora_retorno_real TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. TABELA DE BLOQUEIOS DA AGENDA
CREATE TABLE IF NOT EXISTS public.blocks (
  id TEXT PRIMARY KEY,
  veiculo_id TEXT,
  data_inicio TEXT NOT NULL,
  data_fim TEXT NOT NULL,
  hora_inicio TEXT,
  hora_fim TEXT,
  justificativa TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. DESATIVAR RLS (ROW LEVEL SECURITY) - RECOMENDADO PARA PROTOTIPAGEM
-- (Garante que as consultas do app via chave pública/anon funcionem sem bloqueio de políticas)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks DISABLE ROW LEVEL SECURITY;`;

  const sqlSeedText = `-- CRIAÇÃO DO USUÁRIO ADMINISTRADOR PADRÃO (PREFEITURA)
INSERT INTO public.users (id, name, email, role, password, status)
VALUES (
  'admin_cduc',
  'Prefeitura',
  'veiculos.cduc@gmail.com',
  'ADMIN',
  '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5',
  'APROVADO'
)
ON CONFLICT (email) DO UPDATE SET 
  role = 'ADMIN',
  status = 'APROVADO';

-- INSERÇÃO DOS VEÍCULOS DE EXEMPLO PADRÃO
INSERT INTO public.vehicles (id, name, plate, quantidade_passageiros)
VALUES 
  ('v1', 'Van Renault Master', 'ABC-1234', 15),
  ('v2', 'Gol Volkswagen', 'DEF-5678', 4),
  ('v3', 'Ônibus Mercedes', 'GHI-9012', 40)
ON CONFLICT (id) DO NOTHING;`;

  const sqlMigrationText = `-- ADICIONADO RECENTEMENTE:
-- Se o seu banco de dados já estava criado e você não quer resetar a tabela e sim atualizar para ter o campo novo
ALTER TABLE public.requests ADD COLUMN IF NOT EXISTS horario_no_local TEXT;`;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8" id="supabase-page-container">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-sans tracking-tight flex items-center gap-3">
            <Database className="w-8 h-8 text-emerald-600" />
            Painel de Integração Supabase
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-2xl">
            Configure seu banco de dados na nuvem com o Supabase para ter armazenamento em disco persistente de usuários, frotas e solicitações em tempo real.
          </p>
        </div>

        <div>
          {configured ? (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
              Conectado ao Supabase Cloud
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-200 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />
              Operando em Modo In-Memory / Local
            </div>
          )}
        </div>
      </div>

      {/* Integration Steps Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-3">
          <div className="w-10 h-10 bg-emerald-600/10 text-emerald-700 rounded-lg flex items-center justify-center font-bold font-mono text-lg">
            1
          </div>
          <h3 className="font-semibold text-slate-800">Criar Projeto Grátis</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Acesse o site oficial do <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium inline-flex items-center gap-0.5">Supabase <ExternalLink className="w-3 h-3" /></a> e crie um projeto totalmente gratuito em poucos segundos.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-3">
          <div className="w-10 h-10 bg-emerald-600/10 text-emerald-700 rounded-lg flex items-center justify-center font-bold font-mono text-lg">
            2
          </div>
          <h3 className="font-semibold text-slate-800">Criar Tabelas de Dados</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Abra o SQL Editor em seu painel do Supabase, copie o script de tabelas fornecido abaixo, cole e clique em &quot;Run&quot; para provisionar o banco de dados.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-3">
          <div className="w-10 h-10 bg-emerald-600/10 text-emerald-700 rounded-lg flex items-center justify-center font-bold font-mono text-lg">
            3
          </div>
          <h3 className="font-semibold text-slate-800">Injetar Credenciais</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Insira a URL e a Anon Public Key obtidas nas configurações de API do Supabase na aba &quot;Secrets&quot; ou no arquivo <code className="bg-slate-200/60 px-1 py-0.5 rounded text-slate-700">.env</code> do seu app.
          </p>
        </div>
      </div>

      {/* Section 1: Secrets & Configuration */}
      <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden" id="secrets-config-section">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <span className="font-semibold text-slate-800 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-slate-600" />
            1. Variáveis de Ambiente a Injetar
          </span>
          <button
            onClick={() => handleCopy('env', envText)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-200/50 border border-slate-300 px-3 py-1.5 rounded cursor-pointer transition-all"
          >
            {copiedText === 'env' ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar Variáveis
              </>
            )}
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 font-sans">
            Adicione estas chaves no painel **Settings &gt; Secrets** da sua área de desenvolvimento do Google AI Studio para colocar o banco de dados online. Caso esteja executando localmente, cole no arquivo <code className="bg-slate-100 px-1 py-0.5 rounded text-sm font-semibold">.env.local</code>.
          </p>
          <pre className="bg-slate-950 text-slate-100 rounded-lg p-4 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
            {envText}
          </pre>
        </div>
      </div>

      {/* Section 2: PostgreSQL Schema */}
      <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden" id="postgres-schema-section">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <span className="font-semibold text-slate-800 flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-600" />
            2. Script de Criação das Tabelas (SQL)
          </span>
          <button
            onClick={() => handleCopy('schema', sqlSchemaText)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-200/50 border border-slate-300 px-3 py-1.5 rounded cursor-pointer transition-all"
          >
            {copiedText === 'schema' ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar Script SQL
              </>
            )}
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 font-sans">
            Para inicializar a estrutura do seu banco de dados, clique em **SQL Editor** no painel lateral do Supabase, crie uma **New Query**, cole o código abaixo e clique em **Run**.
          </p>
          <div className="relative">
            <pre className="bg-slate-950 text-slate-100 rounded-lg p-4 font-mono text-xs max-h-[350px] overflow-y-auto leading-relaxed border border-slate-800 scrollbar-thin">
              {sqlSchemaText}
            </pre>
            <div className="absolute bottom-3 right-3 bg-slate-900 bg-opacity-80 px-2 py-1 rounded text-[10px] text-slate-400 font-mono">
              SQL Schema • 4 tabelas
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Seed Script */}
      <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden" id="seed-script-section">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <span className="font-semibold text-slate-800 flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-blue-600" />
            3. Injetar Administrador e Veículos de Partida (Seed SQL)
          </span>
          <button
            onClick={() => handleCopy('seed', sqlSeedText)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-200/50 border border-slate-300 px-3 py-1.5 rounded cursor-pointer transition-all"
          >
            {copiedText === 'seed' ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar Seeds SQL
              </>
            )}
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600">
            Provisione imediatamente o usuário administrador principal (`veiculos.cduc@gmail.com`) e os veículos de saída originais no banco remoto. Cole e rode este script também no SQL Editor:
          </p>
          <pre className="bg-slate-950 text-slate-100 rounded-lg p-4 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
            {sqlSeedText}
          </pre>
        </div>
      </div>

      {/* Section 4: Migrations */}
      <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden" id="migration-script-section">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <span className="font-semibold text-slate-800 flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-indigo-600" />
            4. Atualizações e Correções (Migrations)
          </span>
          <button
            onClick={() => handleCopy('migration', sqlMigrationText)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-300 px-3 py-1.5 rounded cursor-pointer transition-all"
          >
            {copiedText === 'migration' ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar Migration SQL
              </>
            )}
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600">
            Se você já havia configurado o Supabase antes e começou a receber <strong>erros de colunas ausentes</strong> (ex: <code className="bg-slate-100 px-1 py-0.5 rounded">horario_no_local</code>), rode este script no SQL Editor para não perder seus dados existentes e sim apenas adicionar a coluna necessária:
          </p>
          <pre className="bg-slate-950 text-slate-100 rounded-lg p-4 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
            {sqlMigrationText}
          </pre>
        </div>
      </div>

      {/* Important instructions regarding Security Rules (RLS) */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 flex flex-col md:flex-row gap-5 items-start">
        <div className="bg-blue-600/10 text-blue-700 rounded-full p-2.5 shrink-0">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-900 text-sm">Aviso Importante sobre Segurança (Policies / RLS)</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Caso você habilite o **Row Level Security (RLS)** nas tabelas do Supabase, certifique-se de configurar políticas públicas de leitura e escrita para chaves anon, ou simplesmente desabilite RLS durante os testes iniciais e fase de prototipagem para permitir comunicação transparente baseada unicamente nas suas chaves secrets integradas com segurança do lado do nosso servidor (Server-Side).
          </p>
        </div>
      </div>
    </div>
  );
}
