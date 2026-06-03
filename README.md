<h1 align="center">Pingify</h1>

<p align="center">
  <strong>Self-hosted uptime monitoring made simple</strong>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="#"><img src="https://img.shields.io/badge/Bun-000000?style=flat&logo=bun&logoColor=white" alt="Bun"></a>
  <a href="#"><img src="https://img.shields.io/badge/Elysia-FD4F00?style=flat&logo=elysia&logoColor=white" alt="Elysia"></a>
  <a href="#"><img src="https://img.shields.io/badge/Drizzle-C5F74F?style=flat&logo=drizzle&logoColor=black" alt="Drizzle"></a>
  <a href="#"><img src="https://img.shields.io/badge/PostgreSQL-336791?style=flat&logo=postgresql&logoColor=white" alt="PostgreSQL"></a>
  <a href="#"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License"></a>
</p>

---

## Try It Out - Public Demo

**Live instance:** `https://pingify-jnd4.onrender.com`

```bash
# Sign up and start monitoring
open https://pingify-jnd4.onrender.com

# Check the docs
open https://pingify-jnd4.onrender.com/docs

# Health check
curl https://pingify-jnd4.onrender.com/health
```

---

## What's This?

Lightweight, open-source uptime monitoring platform. Add your services, set check intervals, and get real-time status updates. Self-hosted, privacy-first, no vendor lock-in.

---

## Quick Start

### Docker (Recommended)

```bash
git clone https://github.com/daffineq/pingify.git
cd pingify
cp .env.example .env
# Edit .env with your config
docker compose up --build -d
```

### Manual Install

```bash
bun install
cp .env.example .env
# Edit .env with your config
bun run db:migrate
bun run dev  # or bun run prod
```

Server runs at `http://localhost:3000`

---

## How to Use

1. **Sign up** at `/auth`
2. **Add a service** with URL and check interval (in minutes)
3. **View dashboard** at `/` to see real-time status
4. **Check API docs** at `/docs` for programmatic access

### API Endpoints

```bash
# Get user & services
curl -H "Cookie: session=YOUR_SESSION" http://localhost:3000/api/user

# Create service
curl -X POST http://localhost:3000/api/service \
  -H "Cookie: session=YOUR_SESSION" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","interval_m":5,"name":"My Service"}'

# Get service details with history
curl -H "Cookie: session=YOUR_SESSION" http://localhost:3000/api/service/SERVICE_ID

# Update service
curl -X PUT http://localhost:3000/api/service/SERVICE_ID \
  -H "Cookie: session=YOUR_SESSION" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","interval_m":10}'

# Delete service
curl -X DELETE -H "Cookie: session=YOUR_SESSION" http://localhost:3000/api/service/SERVICE_ID

# Health check
curl http://localhost:3000/health

# Server state
curl http://localhost:3000/state
```

Full API docs at `http://localhost:3000/docs`

---

## Free Hosting on Render

### Prerequisites

**Database - Neon (Required)**
- Sign up at [Neon](https://neon.tech)
- Free 500MB PostgreSQL
- Copy connection string

### Deploy

1. Create account at [Render](https://render.com)
2. New Web Service → Connect your repo
3. Set Dockerfile path to `./Dockerfile.render`
4. Add environment variables (check `.env.example`)

**Key env vars:**
```
DATABASE_URL=your_neon_url
PORT=3000
PUBLIC_URL=https://your-app.onrender.com
CORS=https://your-app.onrender.com
```

**Pro tip:** Add your Render instance as a service with 1-minute interval to keep it from spinning down!

---

## Configuration

Check **[.env.example](.env.example)** for all available options.

---

## Scripts

```bash
# Dev
bun run dev              # Hot reload
bun run prod             # Production

# Database
bun run db:generate      # Generate migrations
bun run db:migrate       # Run migrations
bun run db:studio        # Database GUI
bun run db:truncate      # Clear data
bun run db:drop          # Drop tables
```

---

## Tech Stack

- **[Elysia](https://elysiajs.com/)**
- **[Bun](https://bun.sh/)**
- **[TypeScript](https://www.typescriptlang.org/)**
- **[Drizzle](https://orm.drizzle.team/)**
- **[PostgreSQL](https://www.postgresql.org/)**

---

## Contributing

Fork it, branch it, commit it, push it, PR it.

---

## License

**[MIT](LICENSE)** - do whatever you want

---

<p align="center">
  Made by <a href="https://github.com/daffineq">daffineq</a>
</p>

<p align="center">
  <a href="https://github.com/daffineq/pingify/stargazers">⭐ Star this if it's useful</a>
</p>
