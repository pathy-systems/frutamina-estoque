# FRUTAMINA • Contagem de Estoque (CD)

Projeto web para contagem e visualização do estoque com comandos por voz/Texto, filtros e exportação.  
Interface pensada para uso rápido no CD, com modo de **contagem atual** ou **nova contagem** e visualização **detalhada** e **resumida**.

## O que o sistema faz
- Contagem por **voz** (Chrome/Edge) e por **comando manual**.
- Controle por **setor** (ex.: GELADEIRA, CHÃO, ITAUEIRA).
- Tabela **detalhada** e **resumida**.
- **Exportação** (CSV, PDF, Impressão).
- **Login** por usuário/número + senha (sem necessidade de email real).
- Sessão expira em **1 hora**.
- Registro do **último horário de atualização**.

## Tecnologias
- HTML + CSS + JavaScript (frontend estático).
- Supabase (Auth + Postgres + RLS).
- Web Speech API para voz.

## Estrutura do projeto
- `index.html`: visão pública (consulta/visualização).
- `editar.html`: área de edição/contagem (requer login).
- `assets/app.js`: lógica principal.
- `styles.css`: estilos.

## Como rodar localmente
Por ser estático, basta servir os arquivos com um servidor local:

```bash
python -m http.server 5500
```

Depois acesse:
```
http://localhost:5500
```

## Deploy no GitHub Pages
1. Suba o projeto para um repositório no GitHub.
2. Em **Settings → Pages**, selecione `main` e a pasta `/root`.
3. O site ficará disponível no link gerado pelo GitHub Pages.

## Configuração do Supabase

### 1) Criar projeto
Crie um projeto no Supabase e pegue:
- **Project URL**
- **Publishable key**

Atualize no arquivo `assets/app.js`:
```js
const SUPABASE_URL = "https://SEU-PROJETO.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_...";
```

### 2) Ativar login por usuário/número
No Supabase:
- **Authentication → Sign in / Providers**
- Ative **Email** (mesmo que o login seja por nome/numero).

O sistema converte o usuário informado para um email interno:
- `pedro` → `pedro@cd.local`
- `1234` → `1234@cd.local`

### 3) Criar tabela
Crie a tabela `estoque_registros` com os campos:

| Campo | Tipo |
|------|------|
| id | uuid (PK) |
| user_id | uuid |
| setor | text |
| produto | text |
| marca | text |
| tipo | int |
| caixas_pallet | int |
| pallets | int |
| total_caixas | int |
| updated_at | timestamptz |

Sugestão de SQL (opcional):
```sql
create table if not exists public.estoque_registros (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  setor text not null,
  produto text not null,
  marca text not null,
  tipo int not null,
  caixas_pallet int not null,
  pallets int not null,
  total_caixas int not null,
  updated_at timestamptz not null default now()
);
```

Para atualizar `updated_at` automaticamente:
```sql
create extension if not exists moddatetime schema extensions;
create trigger handle_updated_at
before update on public.estoque_registros
for each row execute procedure extensions.moddatetime(updated_at);
```

### 4) Ativar RLS e políticas
Ative **RLS** e use as políticas:

```sql
-- leitura pública (para a visão geral)
create policy "public read"
on public.estoque_registros
for select using (true);

-- inserir só o próprio usuário
create policy "user insert"
on public.estoque_registros
for insert with check (auth.uid() = user_id);

-- atualizar só o próprio usuário
create policy "user update"
on public.estoque_registros
for update using (auth.uid() = user_id);

-- deletar só o próprio usuário
create policy "user delete"
on public.estoque_registros
for delete using (auth.uid() = user_id);
```

## Uso rápido
1. Abra `editar.html`.
2. Faça login com usuário/número + senha.
3. Escolha o setor e realize a contagem.
4. Use **Editar item** para alterar registros existentes.
5. Use **Exportar** para gerar CSV/PDF/Impressão.

## Observações
- A **voz** funciona melhor no Chrome/Edge.
- O sistema possui **dois modos de tabela** (detalhada e resumida).
- O botão **Editar item** só edita registros existentes (não cria novos).

