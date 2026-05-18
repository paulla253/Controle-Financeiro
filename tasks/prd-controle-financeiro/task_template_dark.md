# Task: Implementar Tema Dark no Frontend

## Contexto

O projeto usa **Tailwind CSS v4** com tokens de cor do **Material Design 3** definidos via variáveis CSS no bloco `@theme` do arquivo `globals.css`. O botão "Alterar tema" já existe no `Header.tsx` (linha 43–49), mas está sem funcionalidade — sem `onClick`, sem estado, sem persistência.

---

## Objetivo

Ao clicar no botão "Alterar tema" no `Header`, alternar entre o tema light (atual) e um tema dark completo, com:

- Tokens dark baseados no Material Design 3
- Persistência da preferência no `localStorage`
- Respeito à preferência do sistema operacional (`prefers-color-scheme`) na primeira visita
- Ícone do botão alternando entre `light_mode` e `dark_mode`

---

## Arquivos Envolvidos

| Arquivo | Ação |
|---|---|
| `app/globals.css` | Adicionar tokens dark dentro de `.dark { ... }` |
| `app/providers.tsx` | Adicionar `ThemeProvider` e contexto de tema |
| `app/layout.tsx` | Aplicar a classe `dark` no `<html>` via ThemeProvider |
| `app/components/Header.tsx` | Conectar o botão ao contexto e alternar ícone |

---

## Etapas de Implementação

### 1. Definir tokens de cor do tema dark — `globals.css`

Adicionar um bloco `.dark { ... }` **fora** do `@theme` para sobrescrever os tokens com valores dark do MD3. Os valores seguem o esquema de cor gerado para as mesmas cores-semente do light (`primary: #005da7`, `secondary: #006e1c`, `tertiary: #7f5300`).

```css
/* No final de globals.css, após o bloco @theme */

.dark {
  --color-primary: #a4c9ff;
  --color-on-primary: #003060;
  --color-primary-container: #00468a;
  --color-on-primary-container: #d6e3ff;

  --color-secondary: #76db74;
  --color-on-secondary: #003909;
  --color-secondary-container: #005313;
  --color-on-secondary-container: #91f78e;

  --color-tertiary: #ffb960;
  --color-on-tertiary: #432c00;
  --color-tertiary-container: #5f4200;
  --color-on-tertiary-container: #ffddb0;

  --color-error: #ffb4ab;
  --color-on-error: #690005;
  --color-error-container: #93000a;
  --color-on-error-container: #ffdad6;

  --color-background: #111318;
  --color-on-background: #e1e2e9;

  --color-surface: #111318;
  --color-surface-dim: #111318;
  --color-surface-bright: #37393f;
  --color-surface-container-lowest: #0c0e13;
  --color-surface-container-low: #191c21;
  --color-surface-container: #1d2026;
  --color-surface-container-high: #282a30;
  --color-surface-container-highest: #33353b;

  --color-on-surface: #e1e2e9;
  --color-on-surface-variant: #c1c7d3;

  --color-outline: #8b9199;
  --color-outline-variant: #414751;

  --color-inverse-surface: #e1e2e9;
  --color-inverse-on-surface: #2e3036;
  --color-inverse-primary: #005da7;
  --color-surface-tint: #a4c9ff;
}
```

**Por que fora do `@theme`:** O bloco `@theme` do Tailwind v4 é estático; sobrescritas dinâmicas devem ficar em seletores CSS normais. A classe `.dark` no elemento `<html>` faz os tokens dark vencerem a cascata.

---

### 2. Criar ThemeProvider e hook `useTheme` — `providers.tsx`

Criar contexto React para gerenciar o estado do tema:

```tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({ theme: 'light', toggleTheme: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // 1. Checar localStorage; 2. Checar preferência do SO; 3. Default: light
    const stored = localStorage.getItem('theme') as Theme | null;
    const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
    setTheme(stored ?? preferred);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

Envolver o `QueryClientProvider` e o `ToastContainer` existentes com o `ThemeProvider`:

```tsx
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <ToastContainer ... />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
```

---

### 3. Prevenir flash de tema errado — `layout.tsx`

Adicionar um inline script **antes** do React hidratar, para aplicar a classe `dark` no `<html>` com base no `localStorage` ou `prefers-color-scheme`:

```tsx
// Dentro do <head> ou antes do <body> em layout.tsx
<script
  dangerouslySetInnerHTML={{
    __html: `
      (function() {
        const stored = localStorage.getItem('theme');
        const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', (stored ?? preferred) === 'dark');
      })();
    `,
  }}
/>
```

Isso garante que o `<html>` já tenha (ou não) a classe `dark` antes do primeiro paint, eliminando o FOUC (Flash of Unstyled Content).

---

### 4. Conectar botão ao contexto — `Header.tsx`

```tsx
'use client';

import { useTheme } from '@/app/providers'; // ajustar caminho conforme alias

// Dentro do componente Header:
const { theme, toggleTheme } = useTheme();

// No JSX do botão (linha ~43):
<button
  type="button"
  onClick={toggleTheme}
  aria-label="Alternar tema"
  className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container"
>
  <span className="material-symbols-outlined text-[18px] leading-none">
    {theme === 'dark' ? 'dark_mode' : 'light_mode'}
  </span>
</button>
```

---

### 5. Corrigir cores hardcoded no Toast — `components/Toast.tsx`

Atualmente o `Toast` usa `bg-green-600`, `bg-red-600`, `bg-blue-600`. Mapear para tokens de tema:

| Estado | Antes | Depois (sugestão) |
|---|---|---|
| Sucesso | `bg-green-600` | `bg-secondary text-on-secondary` |
| Erro | `bg-red-600` | `bg-error text-on-error` |
| Info | `bg-blue-600` | `bg-primary text-on-primary` |

> Esta etapa é opcional, mas recomendada para consistência visual no dark mode.

---

## Ordem de Execução

1. **`globals.css`** — tokens dark (sem JS, sem risco de quebra)
2. **`providers.tsx`** — ThemeProvider + useTheme (lógica isolada)
3. **`layout.tsx`** — inline script anti-FOUC
4. **`Header.tsx`** — conectar botão (depende do passo 2)
5. **`Toast.tsx`** — ajuste de cores (opcional, independente)

---

## Critérios de Aceite

- [ ] Clicar em "Alterar tema" alterna visualmente entre light e dark
- [ ] O ícone do botão muda entre `light_mode` e `dark_mode`
- [ ] A preferência é salva no `localStorage` e persiste ao recarregar a página
- [ ] Na primeira visita sem preferência salva, o tema segue `prefers-color-scheme`
- [ ] Não há flash de tema errado (FOUC) ao carregar a página
- [ ] Todas as páginas (Dashboard, Despesas, Categorias) estão legíveis nos dois temas
- [ ] O modal de adicionar despesa (`AddExpenseModal`) está correto no dark
