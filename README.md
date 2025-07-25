# go-iam-ui

**go-iam-ui** is the admin interface for [go-iam](https://github.com/melvinodsa/go-iam) — a lightweight, multi-tenant Identity and Access Management (IAM) system built with Golang.

This UI provides a clean, easy-to-use dashboard for managing authentication providers, clients, users, roles, and resource permissions. It’s designed to make managing your IAM server intuitive and accessible.

---

## 🌐 Features

- 🔀 **Multi-Tenant Management**: Easily switch between and manage multiple projects.
- 🔐 **Auth Provider Configuration**: Integrate and manage providers like Google.
- 🧩 **Client Management**: Manage applications (clients) connected to your IAM instance.
- 👤 **User Management**: View and assign roles to users.
- 🧱 **RBAC**: Create roles, assign resources, and manage permissions visually.
- 💡 **Dynamic API Integration**: Uses environment variable to connect with any running `go-iam` backend.

---

## 🧰 Tech Stack

| Component       | Tech              |
| --------------- | ----------------- |
| Framework       | React + Vite      |
| Styling         | Tailwind CSS      |
| State           | Hookstate         |
| Package Manager | PNPM              |
| API             | REST (via go-iam) |

---

## 🚀 Getting Started

### Option 1: 🔧 Manual Setup (Development)

#### Prerequisites

- Node.js (v18+)
- PNPM
- A running [go-iam](https://github.com/melvinodsa/go-iam) backend

#### Clone and Setup

```bash
git clone https://github.com/melvinodsa/go-iam-ui.git
cd go-iam-ui
pnpm install
cp sample.env .env
```

#### Run the UI

```bash
pnpm dev
```

### Option 2: 🐳 Docker-Based Local Setup (Recommended for Testing)

Use the official go-iam-docker repo to spin up everything with Docker Compose, including:

- MongoDB
- Redis
- go-iam (backend)
- go-iam-ui (admin frontend)

#### Steps

```bash
git clone https://github.com/melvinodsa/go-iam-docker.git
cd go-iam-docker
cp sample.env .env
docker compose up -d
```

#### Access

- Admin UI: [http://localhost:4173](http://localhost:4173)
- API: [http://localhost:3000](http://localhost:3000)

## 📦 Environment Variables

Some important environment variables used in `.env`:

| Variable          | Description                                          |
| ----------------- | ---------------------------------------------------- |
| `VITE_API_SERVER` | URL for go-iam backend - eg: `http://localhost:3000` |
