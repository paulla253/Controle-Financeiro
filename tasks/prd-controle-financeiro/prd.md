# Documento de Requisitos de Produto (PRD): Controle Financeiro

## Visão Geral

Este documento descreve os requisitos para o frontend da aplicação "Controle Financeiro". O objetivo é desenvolver uma interface de usuário clara e intuitiva para ajudar os usuários a registrar, visualizar e gerenciar suas despesas mensais. O frontend consumirá uma API backend existente para realizar suas operações. O projeto visa fornecer uma ferramenta prática para o controle de gastos pessoais, com foco em simplicidade e usabilidade.

## Objetivos

- **Simplificar o Registro de Despesas:** Permitir que o usuário cadastre despesas diárias de forma rápida e eficiente.
- **Oferecer Visualização Clara dos Dados:** Apresentar as despesas em formatos de tabela e gráficos para facilitar a análise e a compreensão dos padrões de gastos.
- **Permitir Gestão de Categorias:** Dar ao usuário a capacidade de personalizar categorias de despesas.
- **Garantir a Integridade dos Dados:** Implementar regras de validação para importação e manipulação de dados.
- **Entregar uma Experiência de Usuário Agradável:** Criar uma interface moderna, responsiva e com opções de tema (claro/escuro).

## Histórias de Usuário

- **Como usuário,** eu quero cadastrar uma nova despesa (com data, categoria e valor) para que eu possa rastrear meus gastos diários.
- **Como usuário,** eu quero criar e nomear minhas próprias categorias de gastos para organizar minhas despesas de acordo com meu estilo de vida.
- **Como usuário,** eu quero excluir categorias que não uso mais, desde que não haja despesas associadas a elas, para manter minha lista de categorias limpa.
- **Como usuário,** eu quero visualizar minhas despesas em uma tabela que eu possa filtrar por data e categoria para encontrar informações específicas.
- **Como usuário,** eu quero visualizar um gráfico de pizza com a distribuição de gastos por categoria no mês atual para entender para onde meu dinheiro está indo.
- **Como usuário,** eu quero ver um gráfico de barras comparando os gastos totais de cada mês ao longo do ano para identificar tendências sazonais.
- **Como usuário,** eu quero importar um lote de despesas de um arquivo CSV para agilizar o cadastro de múltiplos itens.
- **Como usuário,** eu quero exportar minhas despesas para um arquivo CSV para poder analisá-las em outra ferramenta ou manter um backup.
- **Como usuário,** eu quero alternar entre um tema claro e um escuro para adaptar a aparência da aplicação à minha preferência.

## Funcionalidades Principais

### 1. Gestão de Categorias
- **Descrição:** Permite que o usuário crie e exclua categorias de despesas.
- **Importância:** Essencial para a organização e personalização do controle de gastos.
- **Requisitos Funcionais:**
    1.1. O sistema deve permitir a criação de novas categorias de gastos com um nome definido pelo usuário.
    1.2. O sistema deve permitir a exclusão de uma categoria existente.
    1.3. A exclusão de uma categoria só deve ser permitida se não houver nenhuma despesa registrada associada a ela. Caso contrário, o sistema deve exibir uma mensagem de erro informativa.

### 2. Gestão de Despesas
- **Descrição:** Funcionalidade para cadastrar e visualizar as despesas.
- **Importância:** É o recurso central da aplicação.
- **Requisitos Funcionais:**
    2.1. O formulário de cadastro de despesa deve conter os campos: Data, Categoria (seleção) e Valor.
    2.2. As despesas devem ser exibidas em uma tabela.
    2.3. A tabela de despesas deve oferecer filtros por intervalo de datas e por categoria.

### 3. Importação e Exportação de Dados
- **Descrição:** Permite a importação e exportação de dados de despesas via arquivos CSV.
- **Importância:** Facilita a migração de dados e o backup.
- **Requisitos Funcionais:**
    3.1. **Exportação:** O sistema deve gerar um arquivo CSV contendo as despesas com as colunas: `Data (DD/MM/AAAA)`, `Categoria`, `Valor`.
    3.2. **Importação:** O sistema deve permitir o upload de um arquivo CSV com as colunas: `Data (DD/MM/AAAA)`, `Categoria`, `Valor`.
    3.3. Se uma categoria no CSV de importação não existir no sistema, ela deve ser criada automaticamente.
    3.4. Se ocorrer qualquer erro durante a importação (ex: formato de data inválido, valor ausente), a operação inteira deve ser cancelada e o sistema deve exibir uma mensagem de erro clara para o usuário.

### 4. Dashboard de Visualização
- **Descrição:** Apresenta os dados de despesas em gráficos para análise visual.
- **Importância:** Oferece insights rápidos sobre os padrões de gastos.
- **Requisitos Funcionais:**
    4.1. Deve haver um gráfico de barras para a visualização anual, com o eixo X representando os meses e o eixo Y o valor total gasto.
    4.2. Deve haver um gráfico de pizza para a visualização do mês atual, mostrando a porcentagem de gastos por categoria.
    4.3. Se não houver dados para exibir nos gráficos, o sistema deve mostrar a mensagem: "Não possui dados para ser mostrado".

## Experiência do Usuário

- **Fluxo Principal:** O usuário tipicamente acessará o dashboard para uma visão geral, adicionará despesas conforme elas ocorrem e, ocasionalmente, gerenciará suas categorias ou analisará a tabela de despesas.
- **UI/UX:** A interface deve ser limpa e intuitiva, seguindo o layout geral da imagem de referência (`img/escopo.png`), mas com liberdade para melhorias baseadas em boas práticas de UX. O tema padrão será o claro.
- **Tema:** A aplicação deve oferecer uma opção para alternar entre o tema claro (padrão) e o escuro.
- **Acessibilidade:** A interface deve seguir práticas básicas de acessibilidade, como contraste de cores adequado e navegação por teclado.

## Restrições Técnicas de Alto Nível

- O frontend deverá ser construído com **Next.js**.
- Todas as operações de dados (CRUD de categorias e despesas) devem ser realizadas através de chamadas à API do backend (disponível em `apps/backend`).
- A aplicação completa (frontend e backend) deverá ser executável via `docker-compose`.
- Um arquivo `README.md` detalhado deve ser criado na raiz do projeto frontend, explicando a aplicação e o processo de setup.

## Fora do Escopo

- Autenticação de usuários ou sistema de login.
- Suporte a múltiplos usuários ou perfis.
- Funcionalidades de planejamento financeiro, como metas de economia ou investimentos.
- Edição de despesas existentes (o escopo atual inclui apenas criação e visualização).
