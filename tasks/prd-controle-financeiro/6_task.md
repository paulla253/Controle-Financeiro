# Tarefa 6.0: Tela Categories

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Primeira tela end-to-end consumindo o backend: listagem de categorias com botão "Nova Categoria" que abre `AddCategoryModal`. Valida o fluxo client→backend completo (TanStack Query → api-client → REST). Mensagens de feedback (RF-021), tratamento de erro 409 e atualização do cache após mutations.

<requirements>
- RF-001 / RF-004: cadastrar e listar categorias.
- RF-002 / RF-003: excluir e bloquear exclusão (toast com mensagem clara vinda do backend).
- RF-021: toast de sucesso/erro em todas as mutations.
- Hooks `useCategories`, `useCreateCategory`, `useDeleteCategory`.
- Layout segue `layout/gerenciamento_de_categorias` e `layout/modal_cadastro_de_categoria`.
- Texto em pt-BR; identificadores em inglês.
</requirements>

## Subtarefas

- [x] 6.1 Criar `app/lib/queries/useCategories.ts` (query e mutations + invalidação).
- [x] 6.2 Criar `app/components/AddCategoryModal.tsx` (form com `name`, validação local, submit via mutation).
- [x] 6.3 Criar `app/categories/page.tsx` com listagem, botão de adicionar e ação de excluir.
- [x] 6.4 Tratar erro 409 propagando a mensagem do backend para o toast.
- [x] 6.5 Garantir invalidação de `categories` após create/delete e disparo de toast (RF-021).
- [x] 6.6 Specs de componente/integração com MSW.
- [x] 6.7 Validação de build e execução completa dos testes.

## Detalhes de Implementação

Ver `techspec.md` → "Visão Geral dos Componentes (Frontend)", "Endpoints de API (categories)" e "Fluxo de dados".

## Critérios de Sucesso

- Acessar `/categories` lista categorias retornadas pela API (mockada nos testes; real em uso manual).
- Clicar em "Nova Categoria" abre o modal; submit cria registro e atualiza a lista sem reload.
- Excluir categoria com despesas associadas exibe toast com a mensagem do backend; categoria permanece na lista.
- `cd apps/frontend && npm run build && npm run lint && npm test` finaliza com sucesso.

## Testes da Tarefa

- [x] Componente/Integração: `AddCategoryModal.test.tsx` — submissão válida, nome vazio, erro retornado pela API.
- [x] Integração: `categories.page.test.tsx` (com MSW) — render da lista, fluxo de criação, fluxo de exclusão (200 e 409).
- [x] Validação final: `cd apps/frontend && npm run build && npm run lint && npm test` finaliza com sucesso.

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `apps/frontend/app/categories/page.tsx`
- `apps/frontend/app/components/AddCategoryModal.tsx`
- `apps/frontend/app/lib/queries/useCategories.ts`
- `apps/frontend/app/__tests__/AddCategoryModal.test.tsx`
- `apps/frontend/app/__tests__/categories.page.test.tsx`
- `apps/frontend/app/__tests__/mocks/handlers.ts` (handlers de categorias)
