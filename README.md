# Freelio

Marketplace de Freelancers — plataforma onde clientes postam projetos e freelancers enviam propostas, firmam contratos e se comunicam em tempo real.

## Tecnologias

**Backend**
- Java 21 + Spring Boot 3.2.5
- Spring Security com JWT
- Spring WebSocket (chat em tempo real)
- PostgreSQL 16 + Flyway (migrations)
- SpringDoc OpenAPI (Swagger UI)

**Frontend**
- React 19 + TypeScript + Vite
- TanStack Query, React Hook Form, Zod
- Tailwind CSS + Radix UI
- Axios + STOMP/WebSocket

**Infra**
- Docker & Docker Compose

## Requisitos

- Docker e Docker Compose **ou**
- Java 21, Maven e Node.js 18+

## Como executar

### Com Docker (recomendado)

```bash
docker-compose up
```

Isso sobe o banco PostgreSQL e o backend automaticamente.

Em seguida, inicie o frontend:

```bash
cd frontend
npm install
npm run dev
```

### Localmente (sem Docker)

**Banco de dados:** certifique-se de ter um PostgreSQL rodando e configure as credenciais em `src/main/resources/application.yml`.

**Backend:**
```bash
./mvnw spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

| Serviço   | URL                                    |
|-----------|----------------------------------------|
| Frontend  | http://localhost:5173                  |
| Backend   | http://localhost:8080                  |
| Swagger   | http://localhost:8080/swagger-ui.html  |

## Funcionalidades

- Autenticação JWT com roles (Cliente, Freelancer, Admin)
- Criação e gerenciamento de projetos por categoria
- Envio e acompanhamento de propostas
- Contratos com ciclo de vida completo
- Chat em tempo real via WebSocket
- Notificações em tempo real
- Perfil com portfólio, experiências, certificações e links sociais
- Avaliações pós-contrato
- Upload de imagens (perfil e portfólio)

## Estrutura do projeto

```
Freelio/
├── src/                        # Backend Java/Spring Boot
│   └── main/
│       ├── java/com/marketplace/
│       │   ├── auth/
│       │   ├── users/
│       │   ├── projects/
│       │   ├── proposals/
│       │   ├── contracts/
│       │   ├── chat/
│       │   ├── notifications/
│       │   ├── reviews/
│       │   ├── profile/
│       │   └── categories/
│       └── resources/
│           ├── application.yml
│           └── db/migration/   # Flyway SQL (V1–V16)
├── frontend/                   # React/Vite
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── services/
│       ├── contexts/
│       ├── hooks/
│       └── types/
├── docker-compose.yml
└── uploads/                    # Arquivos enviados pelos usuários
```

## Scripts disponíveis

**Frontend:**

| Comando           | Descrição                          |
|-------------------|------------------------------------|
| `npm run dev`     | Inicia o servidor de desenvolvimento |
| `npm run build`   | Gera build de produção             |
| `npm run preview` | Pré-visualiza o build de produção  |
| `npm run lint`    | Executa o ESLint                   |

**Backend:**

| Comando                        | Descrição                        |
|--------------------------------|----------------------------------|
| `./mvnw spring-boot:run`       | Inicia a aplicação               |
| `./mvnw clean package`         | Gera o JAR de produção           |
| `./mvnw clean package -DskipTests` | Gera o JAR sem rodar testes  |
