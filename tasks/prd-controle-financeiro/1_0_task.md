## 1.0 - Gerenciamento de Categorias de Despesas

### Descrição
Implementar a funcionalidade de criação e exclusão de categorias de despesas, permitindo que o usuário organize seus gastos de forma personalizada.

### Escopo
- O usuário deve ser capaz de adicionar novas categorias de despesas.
- O usuário deve ser capaz de visualizar uma lista de todas as categorias existentes.
- O usuário deve ser capaz de excluir categorias de despesas.

### Critérios de Aceitação

#### Criação de Categoria
- [ ] O sistema deve permitir ao usuário inserir um nome para a nova categoria.
- [ ] O nome da categoria deve ser único (case-insensitive). Se o usuário tentar criar uma categoria com um nome já existente, o sistema deve exibir uma mensagem de erro.
- [ ] Após a criação, a nova categoria deve ser exibida na lista de categorias.

#### Exclusão de Categoria
- [ ] O sistema deve permitir ao usuário selecionar uma categoria existente para exclusão.
- [ ] Uma categoria só poderá ser excluída se **não houver nenhuma despesa associada a ela**. Se houver despesas associadas, o sistema deve impedir a exclusão e exibir uma mensagem informativa ao usuário.
- [ ] Após a exclusão bem-sucedida, a categoria não deve mais ser exibida na lista de categorias.

#### Visualização de Categorias
- [ ] O sistema deve exibir uma lista clara e organizada de todas as categorias criadas.
- [ ] A lista de categorias deve ser atualizada em tempo real após operações de criação ou exclusão.

### Considerações Técnicas
- **Backend:** Utilizar os endpoints existentes ou criar novos, se necessário, na API em `apps/backend` para gerenciar as operações CRUD de categorias. (Verificar `apps/backend/src/categories` para entidades e serviços relacionados).
- **Frontend:** Desenvolver a interface de usuário em `apps/frontend` usando Next.js para exibir, adicionar e excluir categorias. As interações devem seguir as diretrizes de UX/UI estabelecidas.
