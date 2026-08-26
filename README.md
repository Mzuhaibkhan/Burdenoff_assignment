# BurdenOff — Support Ticket & SLA Tracker

BurdenOff is a comprehensive, full-stack support ticket system built with a focus on robust SLA (Service Level Agreement) tracking. It automatically calculates precise resolution deadlines, skipping weekends and configuring holidays, while handling real-time timezone complexities. 

Built using a modern monorepo architecture, BurdenOff is fast, type-safe, and provides an exceptionally sleek user experience out-of-the-box.

---

## Architecture & Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Runtime** | [Bun](https://bun.sh/) | Blazing fast startup, built-in package manager, test runner, and bundler. |
| **Backend Framework** | [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server) | Lightweight, spec-compliant GraphQL server with a great plugin ecosystem. |
| **Database** | [PostgreSQL 16](https://www.postgresql.org/) | Robust, ACID-compliant relational data modeling. |
| **ORM** | [Prisma](https://www.prisma.io/) | Type-safe database queries and automated migrations. |
| **Frontend** | [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) | Lightning-fast HMR and the latest React capabilities. |
| **GraphQL Client** | [urql](https://formidable.com/open-source/urql/) | Lightweight (~12KB) and highly customizable GraphQL client. |
| **Auth** | JWT + [Argon2](https://github.com/ranisalt/node-argon2) | Secure, stateless authentication and state-of-the-art password hashing. |
| **Validation** | [Zod](https://zod.dev/) | TypeScript-first schema declaration and validation. |
| **Styling** | Vanilla CSS | Completely custom glassmorphic design system—zero framework bloat. |

---

## Database Schema

```mermaid
erDiagram
  User ||--o{ Ticket : "reports"
  User ||--o{ Ticket : "assigned to"
  User ||--o{ Comment : "authors"
  Ticket ||--o{ Comment : "has"
  Holiday
```

## Status Transitions

The application enforces a strict state machine for ticket statuses:

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

---

## Setup Instructions

### Prerequisites
- [Bun](https://bun.sh/) (v1.0+)
- [Docker](https://www.docker.com/) & Docker Compose
- Node.js (for some Prisma/Vite tooling compatibility)

### Step-by-Step Installation

1. **Clone the repository**
   ```bash
   git clone <repo_url> BurdenOff
   cd BurdenOff
   ```

2. **Start the Database**
   ```bash
   docker compose up -d
   ```

3. **Install Dependencies**
   ```bash
   bun install
   ```

4. **Configure Environment**
   ```bash
   cp .env.example .env
   # Ensure DATABASE_URL is set to postgresql://postgres:postgres@127.0.0.1:5433/burdenoff
   ```

5. **Initialize Database & Seed Data**
   ```bash
   bun run gendb
   bun run seed
   ```

6. **Generate GraphQL Types**
   ```bash
   bun run codegen
   ```

7. **Start the Development Servers**
   ```bash
   bun run dev
   ```

- **Backend / GraphiQL Explorer:** `http://localhost:4000/graphql`
- **Frontend App:** `http://localhost:5173`

---

## Test Accounts (from Seed)

| Role | Name | Email | Password |
|------|------|-------|----------|
| **Reporter** | John Doe | `john@example.com` | `password123` |
| **Agent** | Agent Smith | `agent@example.com` | `password123` |

---

## Running Tests

BurdenOff uses Bun's ultra-fast built-in test runner.

```bash
# Run all unit tests
bun run test:unit

# Run everything
bun run test
```

---

## API & SLA Details

### SLA Policy
- **URGENT**: 1 business hour (First Response) / 4 business hours (Resolution)
- **HIGH**: 4 business hours (First Response) / 8 business hours (Resolution)
- **MEDIUM**: 8 business hours (First Response) / 24 business hours (Resolution)
- **LOW**: 24 business hours (First Response) / 72 business hours (Resolution)

*Business hours default to Monday–Friday, 9:00 AM – 6:00 PM (configurable in `.env`). Holidays can be managed via the Holiday service.*

### Custom Error Codes
- `UNAUTHORIZED`: Invalid or missing credentials.
- `FORBIDDEN`: Lacking required RBAC roles.
- `VALIDATION_ERROR`: Zod schema constraint failed.
- `NOT_FOUND`: Resource missing.
- `INVALID_STATE_TRANSITION`: Attempted illegal ticket status change.

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@127.0.0.1:5433/burdenoff` |
| `JWT_SECRET` | Secret key for signing tokens | `super-secret-jwt-key` |
| `PORT` | API server port | `4000` |
| `BUSINESS_HOURS_START` | Start hour (0-23) | `9` (9 AM) |
| `BUSINESS_HOURS_END` | End hour (0-23) | `18` (6 PM) |
| `BUSINESS_TIMEZONE` | TZ database name | `UTC` |

---

## Future Improvements
- Add email notifications for SLA breach warnings.
- Websocket subscriptions for real-time comment updates.
- Extended metrics & SLA reporting dashboard for admins.
- Granular timezone support per-agent.
