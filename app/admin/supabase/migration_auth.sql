-- ==============================================================================================
-- SCRIPT DE MIGRAÇÃO: Transferir senhas da tabela public.users para authenticator (auth.users)
-- ==============================================================================================

-- 1. Habilitar a extensão pgcrypto (necessária para gerar hashes bcrypt temporários)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Criar a coluna 'auth_id' na tabela 'public.users' para vincular os dados
-- Utilizamos 'auth_id' para que os 'ids' antigos da 'public.users' continuem iguais, 
-- evitando quebrar todas as amarrações do banco de dados (ex: solicitanteId, motoristasIds).
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS auth_id UUID UNIQUE;

-- 3. Bloco anônimo para migrar todos os usuários atuais da public.users para a auth.users
DO $$
DECLARE
  rec RECORD;
  new_uid UUID;
BEGIN
  FOR rec IN SELECT id, email, name, password FROM public.users LOOP
    -- Verifica se já existe um usuário com esse email no auth
    SELECT id INTO new_uid FROM auth.users WHERE email = rec.email LIMIT 1;
    
    IF new_uid IS NULL THEN
      new_uid := gen_random_uuid();
      
      -- Insere o usuário na tabela oficial do Supabase Auth
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
        recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, 
        created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
      )
      VALUES (
        '00000000-0000-0000-0000-000000000000',
        new_uid,
        'authenticated',
        'authenticated',
        rec.email,
        crypt('12345', gen_salt('bf')), -- Todo usuário migrado receberá a senha padrão '12345' do Supabase Auth
        now(), now(), now(),
        '{"provider":"email","providers":["email"]}',
        json_build_object('name', rec.name),
        now(), now(), '', '', '', ''
      );
    END IF;

    -- Vincula o id do auth na nossa public.users
    UPDATE public.users SET auth_id = new_uid WHERE id = rec.id;
  END LOOP;
END;
$$;

-- 4. Opcional: Remover a coluna de senhas da public.users para maior segurança.
-- Atenção: Faça isso somente se já tivermos adaptado o código Next.js para fazer  
-- login via supabase.auth em vez da verificação manual do banco de dados!
-- ALTER TABLE public.users DROP COLUMN password;
