# PRD — Controle Financeiro

## Visão Geral

O **Controle Financeiro** é uma aplicação web monorepo (frontend + backend) destinada a auxiliar uma pessoa no acompanhamento de seus gastos mensais e anuais. O produto resolve o problema da falta de visibilidade sobre para onde o dinheiro está indo, oferecendo cadastro estruturado de despesas por categoria, importação/exportação em massa via CSV e dashboards visuais que tornam evidentes os padrões de consumo.

O usuário-alvo é o próprio dono dos dados, que utiliza o sistema localmente, sem necessidade de login ou compartilhamento. O valor entregue é a substituição de planilhas manuais por uma ferramenta dedicada que combina entrada rápida de dados, filtros úteis e visualizações comparativas (gráfico anual de barras e gráfico mensal de pizza).

## Objetivos

- **Centralizar o registro de despesas**: 100% das despesas pessoais cadastradas em um único lugar, organizadas por categoria e data.
- **Reduzir o tempo de cadastro**: permitir registrar uma despesa manual em até 30 segundos (3 campos) ou importar um lote completo via CSV em uma única ação.
- **Tornar gastos visíveis**: ao acessar o sistema, o usuário deve enxergar imediatamente o panorama financeiro do mês corrente e do ano atual via dashboard.
- **Garantir integridade dos dados**: nenhuma importação parcial; toda regra de negócio (categoria existente, valor positivo) validada antes de persistir.
- **Suportar análise comparativa**: visualizar a distribuição mensal de gastos por categoria (pizza) e a evolução anual mês a mês (barras).

## Histórias de Usuário

**Persona principal — Usuário pessoal (único)**
Pessoa adulta que controla suas próprias finanças e deseja substituir uma planilha por uma ferramenta visual. Não há outros tipos de usuário, pois o sistema é monousuário e sem autenticação.

- Como **usuário**, eu quero **cadastrar uma nova despesa informando data, categoria e valor** para que **eu possa manter meu histórico de gastos atualizado**.
- Como **usuário**, eu quero **excluir uma despesa registrada por engano** para que **meus relatórios reflitam a realidade**.
- Como **usuário**, eu quero **criar e excluir categorias de gastos** para que **eu possa organizar minhas despesas conforme meus hábitos pessoais**.
- Como **usuário**, eu quero **ser impedido de excluir uma categoria que tenha despesas associadas** para que **eu não perca o vínculo histórico dos meus gastos**.
- Como **usuário**, eu quero **importar um arquivo CSV com várias despesas de uma vez** para que **eu não precise digitar cada lançamento manualmente**.
- Como **usuário**, eu quero **que o sistema cancele toda a importação caso qualquer linha do CSV esteja inválida** para que **eu não fique com dados parciais ou inconsistentes**.
- Como **usuário**, eu quero **exportar minhas despesas em CSV** para que **eu tenha um backup ou possa analisar em outras ferramentas**.
- Como **usuário**, eu quero **visualizar minhas despesas em uma tabela filtrável por mês/ano e categoria** para que **eu encontre rapidamente o que procuro**.
- Como **usuário**, eu quero **ver um gráfico de barras com meus gastos mês a mês no ano selecionado** para que **eu identifique períodos de maior consumo**.
- Como **usuário**, eu quero **ver um gráfico de pizza com a distribuição percentual dos meus gastos do mês corrente por categoria** para que **eu entenda onde meu dinheiro está indo**.
- Como **usuário**, ao **abrir o sistema**, quero **cair direto no dashboard** para que **eu tenha visão imediata da minha situação financeira**.

## Funcionalidades Principais

### F1. Gerenciamento de Categorias
Permite organizar as despesas em grupos definidos pelo usuário (ex: assinaturas, supermercado).

- **RF-001**: O sistema deve permitir cadastrar uma nova categoria informando o nome.
- **RF-002**: O sistema deve permitir excluir uma categoria existente.
- **RF-003**: O sistema deve impedir a exclusão de uma categoria que possua qualquer despesa associada, exibindo mensagem clara ao usuário.
- **RF-004**: O sistema deve listar todas as categorias cadastradas em uma tela dedicada de gerenciamento.

### F2. Gerenciamento de Despesas
Núcleo do produto. Permite registrar, listar, filtrar e excluir despesas mensais.

- **RF-005**: O sistema deve permitir cadastrar uma despesa com os campos obrigatórios: data (DD/MM/AAAA), categoria e valor.
- **RF-006**: O sistema deve aceitar apenas valores numéricos **maiores que zero** no campo valor.
- **RF-007**: O sistema deve aceitar apenas categorias **previamente existentes** no cadastro manual de despesas (sem criação inline).
- **RF-008**: O sistema deve permitir excluir uma despesa individual.
- **RF-009**: O sistema deve exibir as despesas em uma tabela ordenada por data (mais recente primeiro por padrão).
- **RF-010**: A tabela deve ser filtrável por **mês/ano** e por **categoria** (filtros combináveis).

### F3. Importação CSV
Carga em lote de despesas a partir de planilha externa.

- **RF-011**: O sistema deve aceitar arquivos CSV com as colunas: **Data (DD/MM/AAAA), Categoria, Valor**.
- **RF-012**: Durante a importação, se uma categoria informada no arquivo não existir, o sistema deve cadastrá-la automaticamente.
- **RF-013**: Se qualquer linha do CSV apresentar erro (data inválida, valor inválido, formato corrompido, etc.), o sistema deve **abortar toda a importação**, não persistir nenhum dado e exibir mensagem de erro ao usuário indicando o problema encontrado.
- **RF-014**: O sistema deve confirmar ao usuário a quantidade de despesas importadas com sucesso ao final do processo.

### F4. Exportação CSV
Permite ao usuário extrair seus dados.

- **RF-015**: O sistema deve permitir exportar todas as despesas em arquivo CSV contendo as colunas: **Data (DD/MM/AAAA), Categoria, Valor**.

### F5. Dashboard e Visualizações
Tela inicial com resumo visual da situação financeira.

- **RF-016**: A página inicial do sistema deve ser o **dashboard**, carregado automaticamente ao acessar a aplicação.
- **RF-017**: O dashboard deve exibir um **gráfico de barras anual**, com o eixo Y representando o valor gasto e o eixo X representando os meses, permitindo comparar o consumo mês a mês.
- **RF-018**: O gráfico de barras anual deve permitir ao usuário **selecionar o ano** a ser visualizado.
- **RF-019**: O dashboard deve exibir um **gráfico de pizza** com a distribuição percentual dos gastos do **mês corrente**, agrupada por categoria.
- **RF-020**: Quando não houver dados para o gráfico de pizza, o sistema deve exibir a mensagem **"Não possui dados para ser mostrado"**.

### F6. Feedback ao Usuário
Comunicação clara sobre resultado das ações.

- **RF-021**: Toda ação que altera dados (cadastrar, excluir, importar, exportar) deve apresentar mensagem de **sucesso** ou **erro** ao usuário.

## Experiência do Usuário

**Jornada principal**: Ao acessar a aplicação, o usuário cai no **dashboard** (gráficos de barras e pizza). A partir da navegação, ele acessa as telas de **Gerenciamento de Despesas** (com tabela filtrável, botão "Adicionar Nova Despesa" que abre modal, e ações de importar/exportar CSV) e **Gerenciamento de Categorias** (com listagem e botão "Nova Categoria" que abre modal).

**Layouts de referência** (já existentes no diretório `layout/`):

- `layout/DESIGN.md` — diretrizes gerais de design.
- `layout/dasboard` — tela inicial.
- `layout/gerenciamento_de_despesas` — listagem e filtros de despesas.
- `layout/modal_adicionar_despesa` — modal acionado pelo botão "Adicionar Nova Despesa".
- `layout/gerenciamento_de_categorias` — listagem e gerenciamento de categorias.
- `layout/modal_cadastro_de_categoria` — modal acionado pelo botão "Nova Categoria".

**Requisitos de UI/UX**:

- Toda a interface deve estar em **português brasileiro (pt-BR)**.
- Datas devem ser exibidas no formato **DD/MM/AAAA**.
- Valores monetários em **Real brasileiro (R$)**, com vírgula como separador decimal e ponto como separador de milhar (ex: R$ 1.234,56).
- Mensagens de feedback (sucesso e erro) devem ser apresentadas ao usuário em todas as ações que alteram dados, de forma visível e não bloqueante quando possível.
- Os gráficos devem ser legíveis e responder ao filtro de ano (barras) e ao mês corrente (pizza) sem necessidade de recarregar a página.

## Restrições Técnicas de Alto Nível

- **Persistência local**: o banco de dados é **SQLite**, executado localmente junto à aplicação. Não há integração com serviços externos de armazenamento.
- **Monorepo**: aplicação dividida em `apps/backend` (NestJS), `apps/frontend` (Next.js) e `apps/e2e` (Playwright).
- **Sem autenticação e sem multiusuário**: todos os dados pertencem a um único usuário implícito; não há controles de identidade, permissão ou compartilhamento.
- **Documentação de API**: o backend deve expor documentação OpenAPI/Swagger para todos os endpoints públicos.
- **Privacidade**: como o sistema é monousuário e local, não há requisitos regulatórios externos; ainda assim, dados financeiros pessoais não devem ser expostos a terceiros nem trafegados para fora do ambiente local.
- **Performance**: não há metas formais de TPS ou latência, dado o uso pessoal e single-user; espera-se resposta perceptivelmente instantânea (< 1s) em operações típicas.
- **Idioma e formato**: a aplicação opera exclusivamente em português brasileiro com formatos de data e moeda do Brasil.

*(Detalhes de implementação — bibliotecas específicas, estrutura de testes, ORM, formato de validação — serão tratados na Tech Spec.)*

## Fora de Escopo

As seguintes capacidades **não fazem parte** desta entrega e não devem ser implementadas:

- **Múltiplos usuários**: o sistema atende apenas um usuário implícito.
- **Sistema de login / autenticação**: nenhum mecanismo de cadastro, login, senha ou recuperação de acesso.
- **Metas de investimentos**: o produto trata apenas de despesas; não há módulos de receitas, metas, investimentos ou planejamento financeiro.
- **Testes de performance**: não serão definidos nem executados testes de carga, stress ou benchmark.
- **Testes de integração no backend**: cobertos apenas testes de unidade (Jest) e e2e (supertest no backend; Playwright no nível da aplicação).
- **Testes de unidade no frontend**: o frontend terá apenas testes de componente e integração com mock de API.
- **Controle de versão (Git)**: não há requisito de versionamento via Git como parte deste escopo.
- **Validação de data futura**: o cadastro de despesa não restringe datas futuras; cabe ao usuário decidir o que registrar.
- **Limite máximo de valor por despesa**: não há teto de valor além da regra de "maior que zero".
- **Edição de despesas e categorias**: o escopo cobre criação e exclusão; **alteração de registros existentes não está prevista** (caso necessário, o usuário exclui e recria).
- **Responsividade mobile e acessibilidade WCAG formal**: não fazem parte dos requisitos obrigatórios desta versão (boas práticas gerais de UX/UI continuam aplicáveis).

*(Riscos e detalhes de implementação técnica serão abordados na Tech Spec.)*
