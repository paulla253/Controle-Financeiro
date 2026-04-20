# Objetivo

- Desenvolva o frontend chamado "Controle Financeiro" para auxiliar no controle gastos

## Diretrizes de Negócio

- Criação e exclusão de categorias de gastos (ex: assinaturas, supermercado).
- Exclusão de categorias de gastos, deverá ser permitida apenas se não tiver nenhuma despesa associada.
- Cadastrar desespesas mensais com as seguintes informções Data, categoria e valor
- A importação de dados em CSV das despesas tera que possuir os seguintes campos Data (DD/MM/AAAA), Categoria e Valor, caso a categoria não exista cadastrar.
- Exportação em CSV dos dados de despesas com os seguintes campos Data (DD/MM/AAAA), Categoria e Valor
- Vizualização das desepsas em uma tabela, podendo ser filtrado por data e categoria.
- Caso ocorra um erro ao realizar a importação de dados, não deverá seguir com a ação e deverá avisar o usuário.
- Visualizaçao das informações anuais em um gráfico de barras, sendo o eixo y para o valor gasto e o X para o mes (ex: exemplo comparação que no mes de janeiro deve um gasto maior com supermecado)
- Visualização das informações dos gastos do mes atual em um gráfico de pizza, trazendo a porcentagem por categoria, caso não tenha dados para serem mostrados informar o usuário "Não possui dados para ser mostrado"

## Diretrizes Técnicas

- A parte do backend está disponivel em apps/backend, verificar o readme para conhecer os endpoints
- O frontend será desenvolvido na pasta apps/frontend instalado Nextjs e deverá seguir boas práticas de UX e UI.
- Utilizar arquivo de imagem como uma referencia img/escopo.png.
- O template do frontend deverá ter a possibilidade de escolher tema claro e dark.
- Para executar o projeto (backend e fronted) deverá executar o docker
- Criar um README detalhado do que se trata a aplicação e um passo a passo de como subir a aplicação via Docker

## Fora do Escopo

- Não envolverá multiplos usuários
- Não terá sistema de login.
- Não terá metas de investimentos
