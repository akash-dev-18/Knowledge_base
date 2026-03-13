# 🧠 KnowledgeBase AI

> A production-grade **microservices-based** multi-tenant SaaS platform that lets teams upload documents and chat with them using AI — two independently deployable services communicating over REST.

![Architecture](https://img.shields.io/badge/Architecture-Microservices-blueviolet?style=flat-square)
![Java](https://img.shields.io/badge/Java-17-orange?style=flat-square&logo=java)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen?style=flat-square&logo=springboot)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=nextdotjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue?style=flat-square&logo=postgresql)
![Qdrant](https://img.shields.io/badge/Qdrant-Vector%20DB-red?style=flat-square)
![Redis](https://img.shields.io/badge/Redis-Cloud-red?style=flat-square&logo=redis)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)

---

## 📌 What is this?

KnowledgeBase AI is a **multi-tenant document intelligence platform** where companies can:

- Register their organization and invite team members
- Create workspaces to organize documents
- Upload PDFs/text files and **chat with them using AI**
- Get automatic summaries, key points, and Q&A from documents
- Control access with role-based permissions (Owner, Admin, Member, Viewer)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js Frontend                      │
│                    (TypeScript + Tailwind)                   │
└──────────────────┬──────────────────────┬───────────────────┘
                   │                      │
          REST API │                      │ REST API
                   ▼                      ▼
┌──────────────────────┐    ┌─────────────────────────┐
│   Spring Boot API    │    │      FastAPI Service     │
│   (Port 8080)        │    │      (Port 8000)         │
│                      │    │                          │
│  • Auth & JWT        │    │  • PDF Processing        │
│  • User Management   │    │  • Text Chunking         │
│  • Company/Workspace │    │  • Embeddings (OpenAI)   │
│  • Document CRUD     │───▶│  • Vector Search         │
│  • Role-based Access │    │  • AI Chat (Streaming)   │
│                      │    │  • Summary & Key Points  │
└──────────┬───────────┘    └────────────┬────────────┘
           │                             │
     ┌─────┴──────┐              ┌───────┴──────┐
     │ PostgreSQL  │              │    Qdrant    │
     │  (NeonDB)   │              │  Vector DB   │
     └─────────────┘              └──────────────┘
                                         │
                                  ┌──────┴──────┐
                                  │    Redis    │
                                  │   (Cloud)   │
                                  └─────────────┘
```

---

## 🧩 Microservices Design

This project is split into **2 independently deployable services** — each with its own tech stack, database, and responsibility:

| Service                  | Tech                   | Responsibility                                       |
| ------------------------ | ---------------------- | ---------------------------------------------------- |
| `CoreBackend-SpringBoot` | Java 17, Spring Boot 3 | Auth, users, companies, workspaces, document CRUD    |
| `fastapi-ai-services`    | Python, FastAPI        | Document processing, embeddings, RAG chat, streaming |

Each service can be **scaled, deployed, and updated independently**. Spring Boot calls FastAPI over internal REST when a document is uploaded or deleted.

### 🔐 Authentication & Multi-tenancy

- JWT-based authentication with secure token handling
- Company registration — every company gets its own isolated data
- Role-based access control: **Owner → Admin → Member → Viewer**
- Invite team members directly into your company

### 📁 Workspace Management

- Create multiple workspaces per company
- Add/remove members with specific roles
- Full CRUD with authorization checks

### 📄 Document Intelligence

- Upload PDF and TXT files
- Documents automatically processed and indexed into vector DB
- Real-time status tracking: `UPLOADING → READY → INDEXED`

### 🤖 AI Chat (RAG Pipeline)

- **Chat with your documents** — ask anything, get context-aware answers
- **Streaming responses** — word-by-word output like ChatGPT
- **Auto Summary** — comprehensive document summary in seconds
- **Key Points Extraction** — bullet points of the most important info
- **Q&A Generation** — auto-generate question-answer pairs from documents
- **Chat History** — conversation context maintained via Redis
- **Multi-document support** — chat across different documents

### 👥 Team Management

- View all company members
- Update roles, suspend users
- Only Owners can delete the company or invite new members

---

## 🛠️ Tech Stack

### Backend — Spring Boot Service

| Technology                  | Purpose                               |
| --------------------------- | ------------------------------------- |
| Java 17 + Spring Boot 3.x   | Core API framework                    |
| Spring Security + JWT       | Authentication & authorization        |
| Spring Data JPA + Hibernate | ORM & database access                 |
| PostgreSQL (NeonDB)         | Primary database                      |
| Lombok                      | Boilerplate reduction                 |
| RestClient                  | HTTP client for FastAPI communication |

### AI Service — FastAPI

| Technology         | Purpose                           |
| ------------------ | --------------------------------- |
| Python + FastAPI   | Async AI microservice             |
| LangChain          | LLM orchestration & RAG pipeline  |
| OpenRouter API     | LLM access (100+ models)          |
| Qdrant             | Vector database for embeddings    |
| Redis Cloud        | Chat history & session management |
| PyPDF2             | PDF text extraction               |
| Server-Sent Events | Streaming AI responses            |

### Frontend — Next.js

| Technology               | Purpose                 |
| ------------------------ | ----------------------- |
| Next.js 14 (App Router)  | React framework         |
| TypeScript               | Type safety             |
| Tailwind CSS + shadcn/ui | UI components           |
| Zustand                  | Global state management |
| TanStack Query           | API calls & caching     |

---

## 🗂️ Project Structure

```
knowledgebase-ai/
│
├── CoreBackend-SpringBoot/          # Spring Boot Service
│   └── src/main/java/com/springboot/backend/
│       ├── controller/              # REST controllers
│       ├── service/                 # Business logic
│       ├── repository/              # JPA repositories
│       ├── entity/                  # JPA entities
│       ├── dto/                     # Request/Response DTOs
│       ├── mapper/                  # Entity ↔ DTO mappers
│       ├── filter/                  # JWT filter
│       ├── config/                  # Security config
│       └── util/                    # SecurityUtils
│
├── fastapi-ai-services/             # FastAPI AI Service
│   └── app/
│       ├── core/                    # Config & settings
│       ├── services/
│       │   ├── document_service.py  # PDF processing & chunking
│       │   ├── vector_service.py    # Qdrant operations
│       │   └── chat_service.py      # RAG chat + streaming
│       └── routes/
│           ├── document.py          # Document endpoints
│           └── chat.py              # Chat endpoints
│
└── frontend/                        # Next.js Frontend
    └── app/
        ├── (auth)/                  # Login & Register
        ├── dashboard/               # Main dashboard
        ├── workspaces/              # Workspace management
        └── documents/               # Document chat UI
```

---

## 🚀 Getting Started

### Prerequisites

- Java 17+
- Python 3.10+
- Node.js 18+
- PostgreSQL (or NeonDB account)
- Qdrant Cloud account
- Redis Cloud account
- OpenRouter API key

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/knowledgebase-ai.git
cd knowledgebase-ai
```

### 2. Spring Boot Setup

```bash
cd CoreBackend-SpringBoot
```

Create `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://your-neon-host/neondb?sslmode=require
spring.datasource.username=your_username
spring.datasource.password=your_password

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

app.jwt.secret=your-256-bit-secret-key-minimum-32-characters
app.jwt.expiry=86400000

fastapi.url=http://localhost:8000
file.upload.dir=uploads/
```

```bash
./mvnw spring-boot:run
```

### 3. FastAPI Setup

```bash
cd fastapi-ai-services
pip install -r requirements.txt
```

Create `.env`:

```env
OPENROUTER_API_KEY=your-openrouter-key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
LLM_MODEL=mistralai/mistral-7b-instruct

QDRANT_URL=your-qdrant-cloud-url
QDRANT_API_KEY=your-qdrant-api-key
QDRANT_COLLECTION=documents

REDIS_URL=redis://:password@host:port
```

```bash
uvicorn app.main:app --reload --port 8000
```

### 4. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_SPRING_URL=http://localhost:8080
NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000
```

```bash
npm run dev
```

---

## 📡 API Reference

### Spring Boot — `http://localhost:8080`

| Method | Endpoint                        | Description              | Auth           |
| ------ | ------------------------------- | ------------------------ | -------------- |
| POST   | `/api/auth/register`            | Register company + owner | ❌             |
| POST   | `/api/auth/login`               | Login                    | ❌             |
| POST   | `/api/auth/invite`              | Invite team member       | ✅ Owner       |
| GET    | `/api/users/me`                 | Get current user         | ✅             |
| GET    | `/api/users`                    | Get all company users    | ✅             |
| PATCH  | `/api/users/me`                 | Update profile           | ✅             |
| GET    | `/api/companies/{id}`           | Get company details      | ✅             |
| PATCH  | `/api/companies/{id}`           | Update company           | ✅ Owner/Admin |
| POST   | `/api/workspaces`               | Create workspace         | ✅ Owner/Admin |
| GET    | `/api/workspaces`               | List workspaces          | ✅             |
| POST   | `/api/workspaces/{id}/members`  | Add member               | ✅ Owner/Admin |
| POST   | `/api/documents`                | Upload document          | ✅             |
| GET    | `/api/documents/workspace/{id}` | List documents           | ✅             |
| DELETE | `/api/documents/{id}`           | Delete document          | ✅             |

### FastAPI — `http://localhost:8000`

| Method | Endpoint                    | Description                    |
| ------ | --------------------------- | ------------------------------ |
| POST   | `/documents/process/{id}`   | Process & embed document       |
| POST   | `/chat/`                    | Chat with document (invoke)    |
| POST   | `/chat/stream`              | Chat with document (streaming) |
| POST   | `/chat/summary`             | Generate document summary      |
| POST   | `/chat/key-points`          | Extract key points             |
| POST   | `/chat/generate-questions`  | Generate Q&A pairs             |
| DELETE | `/chat/history/{sessionId}` | Clear chat history             |

---

## 🔑 Role Permissions

| Action                | Owner | Admin | Member | Viewer |
| --------------------- | ----- | ----- | ------ | ------ |
| Company update        | ✅    | ✅    | ❌     | ❌     |
| Company delete        | ✅    | ❌    | ❌     | ❌     |
| Invite members        | ✅    | ❌    | ❌     | ❌     |
| Create workspace      | ✅    | ✅    | ❌     | ❌     |
| Add workspace members | ✅    | ✅    | ❌     | ❌     |
| Upload documents      | ✅    | ✅    | ✅     | ❌     |
| Delete documents      | ✅    | ✅    | ✅     | ❌     |
| Chat with documents   | ✅    | ✅    | ✅     | ✅     |
| View everything       | ✅    | ✅    | ✅     | ✅     |

---

## 🧬 Database Schema

```
Company ──< Role
   │
   └──< User >── WorkspaceUser >── Workspace ──< Document
```

**Key entities:** `Company`, `Role`, `User`, `Workspace`, `WorkspaceUser`, `Document`

All entities extend `BaseEntity` with `UUID` primary key, `createdAt`, `updatedAt` via JPA Auditing.

---

## 🤖 RAG Pipeline

```
PDF Upload
    │
    ▼
Text Extraction (PyPDF2)
    │
    ▼
Text Chunking (500 chars, 50 overlap)
    │
    ▼
Embedding Generation (OpenAI ada-002 via OpenRouter)
    │
    ▼
Vector Storage (Qdrant Cloud)
    │
    ▼
User Question ──► Semantic Search ──► Top-K Chunks ──► LLM ──► Streaming Answer
                                                          ▲
                                                     Chat History
                                                       (Redis)
```

## 📝 License

MIT License — feel free to use this project for learning or as a base for your own SaaS.

---

## 👨‍💻 Author

Built with ❤️ as a full-stack microservices learning project.

> **Spring Boot** + **FastAPI** + **Next.js** + **LangChain** + **Qdrant** + **Redis** — all wired together into one production-grade platform.
