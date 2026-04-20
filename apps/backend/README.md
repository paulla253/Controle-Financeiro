# Backend (Controle Financeiro V4)

Este é o backend do projeto Controle Financeiro V4, desenvolvido com NestJS.

## Instalação

1.  Navegue até o diretório `apps/backend`:
    ```bash
    cd apps/backend
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```

## Executando a Aplicação

Para iniciar o servidor de desenvolvimento com hot-reload:

```bash
npm run start:dev
```

A aplicação estará disponível em `http://localhost:3000`.

## Endpoints da API

A seguir estão os endpoints disponíveis na API.

### Health Check

| Método | Rota | Descrição                  |
| :----- | :--- | :------------------------- |
| `GET`  | `/`  | Verifica o status da API. |

### Categorias (`/api/categories`)

| Método   | Rota              | Descrição                                |
| :------- | :---------------- | :--------------------------------------- |
| `POST`   | `/`               | Cria uma nova categoria.                 |
| `GET`    | `/`               | Lista todas as categorias existentes.    |
| `DELETE` | `/:id`            | Remove uma categoria pelo seu ID.        |

### Despesas (`/api/expenses`)

| Método | Rota | Descrição                                  |
| :----- | :--- | :----------------------------------------- |
| `POST` | `/`  | Registra uma nova despesa.                 |
| `GET`  | `/`  | Lista todas as despesas do mês corrente.   |

### Dashboard (`/api/dashboard`)

| Método | Rota        | Descrição                                                          |
| :----- | :---------- | :------------------------------------------------------------------- |
| `GET`  | `/`         | Retorna os dados do dashboard para o mês atual.                      |
| `GET`  | `/annual`   | Retorna os gastos anuais consolidados por mês.                       |
| `GET`  | `/monthly`  | Retorna os dados do dashboard para um mês e ano específicos (query params: `month`, `year`). |

### Perfil (`/api/profile`)

| Método | Rota | Descrição                |
| :----- | :--- | :----------------------- |
| `GET`  | `/`  | Obtém o perfil do usuário. |
| `PUT`  | `/`  | Atualiza o perfil do usuário. |
