# BurdenOff — Support Ticket & SLA Tracker

BurdenOff is a comprehensive, full-stack support ticket system built with a focus on robust SLA (Service Level Agreement) tracking. It automatically calculates precise resolution deadlines, skipping weekends and configuring holidays, while handling real-time timezone complexities. 

Built using a modern monorepo architecture, BurdenOff is fast, type-safe, and provides an exceptionally sleek user experience out-of-the-box.

---

## Project Overview

BurdenOff allows users (Reporters) to create tickets, and support staff (Agents) to pick them up, track them, and resolve them against strict Service Level Agreements (SLAs). The core feature is its real-time SLA engine which dynamically recalculates due dates and risk statuses based on configurable business hours, weekends, and dynamically inputted holidays.

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Runtime & Tooling** | [Bun](https://bun.sh/) | Blazing fast startup, built-in package manager, test runner, and bundler. |
| **Backend Framework** | [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server) | Lightweight, spec-compliant GraphQL server. |
| **Database** | [PostgreSQL 16](https://www.postgresql.org/) | Robust, ACID-compliant relational data modeling. |
| **ORM** | [Prisma](https://www.prisma.io/) | Type-safe database queries and automated migrations. |
| **Frontend** | [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) | Lightning-fast HMR and modern React capabilities. |
| **GraphQL Client** | [urql](https://formidable.com/open-source/urql/) | Lightweight (~12KB) and highly customizable GraphQL client. |
| **Auth** | JWT + [Argon2](https://github.com/ranisalt/node-argon2) | Secure, stateless authentication and state-of-the-art password hashing. |
| **Validation** | [Zod](https://zod.dev/) | TypeScript-first schema declaration and validation. |
| **Styling** | Vanilla CSS | Custom glassmorphic design system—zero framework bloat. |

---

## Architecture Overview

The project uses a monorepo structure managed by Bun workspaces.
- `apps/server`: The backend GraphQL Yoga server, Prisma ORM, and SLA engine.
- `apps/web`: The frontend React application built with Vite.
- `packages/shared`: Shared TypeScript types, enums, and constants used by both frontend and backend for end-to-end type safety.

The application follows a standard layered architecture: API Resolvers -> Services -> Database. 

---

## Database Schema Overview

The database is powered by PostgreSQL and modeled via Prisma with the following core entities:

- **User**: Stores user credentials, roles (`REPORTER` or `AGENT`), and relations to tickets and comments.
- **Ticket**: Represents a support request with fields for title, description, priority, and timestamps for tracking First Response and Resolution SLAs.
- **Comment**: Represents a conversation thread on a ticket between the reporter and agents.
- **Holiday**: Defines non-working days that are excluded from SLA calculations.

```mermaid
erDiagram
  User ||--o{ Ticket : "reports"
  User ||--o{ Ticket : "assigned to"
  User ||--o{ Comment : "authors"
  Ticket ||--o{ Comment : "has"
  Holiday
```

---

## SLA Calculation Approach

SLA deadlines are calculated strictly in **business hours**. 
By default, this is Monday–Friday, 9:00 AM – 6:00 PM (configurable via environment variables).

When a ticket is created:
1. The SLA engine calculates the exact `firstResponseDueAt` and `resolutionDueAt` timestamps by iterating through the timeline.
2. It explicitly skips weekends (Saturday & Sunday).
3. It checks the `Holiday` database table and skips any dates registered as holidays.
4. Each ticket is dynamically evaluated into three statuses:
   - **ON_TRACK**: `< 75%` of the SLA budget consumed.
   - **AT_RISK**: `>= 75%` of the SLA budget consumed.
   - **BREACHED**: Deadline passed.

---

## Status Transition Rules

The application enforces a strict state machine for ticket statuses to ensure data integrity:

```mermaid
stateDiagram-v2
  [*] --> OPEN
  OPEN --> IN_PROGRESS
  OPEN --> CLOSED
  IN_PROGRESS --> RESOLVED
  IN_PROGRESS --> OPEN
  IN_PROGRESS --> CLOSED
  RESOLVED --> CLOSED
  RESOLVED --> OPEN
  CLOSED --> OPEN
```
*Note: A ticket cannot transition from OPEN directly to RESOLVED without first being marked IN_PROGRESS.*

---

## Authentication Approach

BurdenOff uses **stateless JWT (JSON Web Tokens)** for authentication.
1. When a user registers or logs in, their password is securely hashed using **Argon2**.
2. A JWT containing the user's `userId` and `role` is generated and returned to the client.
3. The frontend stores this token and includes it in the `Authorization: Bearer <token>` header for all subsequent GraphQL requests.
4. The backend validates the token via context in GraphQL Yoga, enforcing Role-Based Access Control (RBAC) at the resolver level.

---

## Environment Variables

Copy the `.env.example` file to `.env` in the root of the project:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@127.0.0.1:5433/burdenoff` |
| `JWT_SECRET` | Secret key for signing tokens | `super-secret-jwt-key` |
| `PORT` | API server port | `4000` |
| `BUSINESS_HOURS_START` | Start hour (0-23) | `9` (9 AM) |
| `BUSINESS_HOURS_END` | End hour (0-23) | `18` (6 PM) |
| `BUSINESS_TIMEZONE` | TZ database name | `UTC` |

---

## Setup Instructions

### Prerequisites
- [Bun](https://bun.sh/) (v1.0+)
- [Docker](https://www.docker.com/) & Docker Compose

### Standard Setup Flow

To get everything running quickly with default test data, run the following commands in sequence:

```bash
docker compose up -d && bun install && bun run gendb && bun run dev
```

### Detailed Setup Steps

If you need to run specific parts of the setup manually:

1. **Start the Database**
   ```bash
   docker compose up -d
   ```

2. **Install Dependencies**
   ```bash
   bun install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   ```

#### Database Migration Instructions
To apply database migrations and generate the Prisma Client:
```bash
bun run gendb
# Or natively: bunx prisma migrate dev && bunx prisma generate
```

#### Seed Instructions
To populate the database with test users and sample data:
```bash
bun run seed
# Test accounts: john@example.com (Reporter), agent@example.com (Agent) - Password: password123
```

---

## Running the Application

You can run both the frontend and backend concurrently from the root directory:
```bash
bun run dev
```

If the frontend and backend require separate processes, use the exact commands below:

#### How to run the backend (GraphQL Server)
```bash
bun run dev:server
```
*Backend / GraphiQL Explorer runs at: `http://localhost:4000/graphql`*

#### How to run the frontend (React Vite App)
```bash
bun run dev:web
```
*Frontend App runs at: `http://localhost:5173`*

---

## How to run tests

BurdenOff uses Bun's ultra-fast built-in test runner.

```bash
# Run all tests
bun test

# Run unit tests only
bun run test:unit

# Run integration tests only
bun run test:integration
```

---

## Example GraphQL Queries & Mutations

You can test these in the GraphiQL explorer at `http://localhost:4000/graphql`.

### 1. Login (Mutation)
```graphql
mutation Login {
  login(input: {
    email: "agent@example.com",
    password: "password123"
  }) {
    token
    user {
      id
      name
      role
    }
  }
}
```

### 2. Create Ticket (Mutation)
*Requires Reporter Token*
```graphql
mutation CreateTicket {
  createTicket(input: {
    title: "Cannot access database",
    description: "I am getting a connection timeout when trying to access the prod db.",
    priority: HIGH
  }) {
    id
    title
    status
    sla {
      firstResponseDueAt
      resolutionDueAt
    }
  }
}
```

### 3. List Tickets (Query)
*Requires Auth Token*
```graphql
query ListTickets {
  tickets(take: 10) {
    nodes {
      id
      title
      status
      priority
      createdAt
      sla {
        firstResponseState
        resolutionState
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

### 4. Assign Ticket (Mutation)
*Requires Agent Token*
```graphql
mutation AssignTicket($ticketId: ID!, $assigneeId: ID!) {
  assignTicket(ticketId: $ticketId, assigneeId: $assigneeId) {
    id
    status
    assignee {
      name
    }
  }
}
```
