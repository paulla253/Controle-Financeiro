# Objetivo

- Desenvolva um software monorepo (frontend e Backend) chamado "Controle Financeiro" para auxiliar no controle gastos

## Diretrizes de Negócio

- Criação e exclusão de categorias de gastos (ex: assinaturas, supermercado).
- Exclusão de categorias de gastos, deverá ser permitida apenas se não tiver nenhuma despesa associada.
- Cadastrar desespesas mensais com as seguintes informções data, categoria e valor
- Excluir despesa,
- A importação de dados em CSV das despesas tera que possuir os seguintes campos Data (DD/MM/AAAA), categoria e valor, caso a categoria não exista cadastrar.
- Exportação em CSV dos dados de despesas com os seguintes campos Data (DD/MM/AAAA), Categoria e Valor
- Vizualização das despesas em uma tabela, podendo ser filtrado por data e categoria.
- Caso ocorra um erro ao realizar a importação de dados, não deverá seguir com a ação e deverá avisar o usuário.
- Visualizaçao das informações anuais em um gráfico de barras, sendo o eixo y para o valor gasto e o X para o mes (ex: exemplo comparação que no mes de janeiro deve um gasto maior com supermecado)
- Visualização das informações dos gastos do mes atual em um gráfico de pizza, trazendo a porcentagem por categoria, caso não tenha dados para serem mostrados informar o usuário "Não possui dados para ser mostrado"

## Diretrizes Técnicas

- O backend deverá ser desenvolvido na pasta apps/backend, com NestJS já instalado
- O backend deverá ter a documentação dos endpoints utilizando o swagger.
- As validações que ocorrem no controller deverão ser realizadas pela biblioteca class-validator.
- Todos os arquivos de backend deverão possuir teste de unidade com Jest.
- Todo endpoint deverá possuir teste e2e com a biblioteca supertest.
- O banco de dados será SQLlite e deverá utilizar a biblioteca TypeORM
- O frontend será desenvolvido na pasta apps/frontend, já instalado o Nextjs e devendo seguir boas práticas de UX e UI.
- O frontend deverá usar a biblioteca chart.js para mostrar a parte gráfica
- O frontend deverá ter teste de componente e integração, mocando o retorno da API que está presente na pasta apps/backend.
- Toda parte visual deverá estar em portugues brasileiro, e as datas no formato dd/MM/YYYY
- Ao acessar a página inicial deverá carregar um dashboard
- Na pasta apps/e2e contem o playwright para a realização de testes de e2e.

## Layout do Frontend

- Informações do design em layout/DESIGN.md
- Ao entrar no site, deverá carregar a página de dashboard e o layout se encontra em layout/dasboard
- Terá uma tela para o gerenciamento de despesas, e o layout se encontra em layout/gerenciamento_de_despesas, e se o usuário clicar no botão adicionar nova despesas deverá abrir o modal que se encontra em layout/modal_adicionar_despesa
- Terá uma tela para gerenciamento de categorias e o layout se encontra em layout/gerenciamento_de_categorias e ao clicar no botão Nova Categoria deverá abrir o motal layout/modal_cadastro_de_categoria

## Fora do Escopo

- Não envolverá multiplos usuários
- Não terá sistema de login.
- Não terá metas de investimentos
- Não terá teste de perfomance
- Não terá teste de integração no backend
- Não terá teste de unidade no frontend
- Não teverá fazer nenhum controle de versão gom o git
