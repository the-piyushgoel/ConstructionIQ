# 🏗️ ConstructionIQ

> **AI-Powered Construction Risk Intelligence Platform**
>
> Predict risks. Simulate outcomes. Generate recovery plans. Enable better project decisions.

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![Express](https://img.shields.io/badge/Express.js-Backend-000000?logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?logo=redis)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker)

---

## 📌 Overview

ConstructionIQ is an AI-powered decision intelligence platform designed for construction project managers.

Instead of simply tracking project data, the platform continuously analyzes project context, predicts risks, coordinates specialized AI agents, simulates recovery strategies, and recommends the best course of action before problems become expensive.

The system follows a modular Clean Architecture with secure REST APIs, production-grade validation, structured logging, background processing support, and extensible AI provider integrations.

---

# ✨ Key Features

* 🤖 AI-powered construction risk prediction
* 🧠 Multi-Agent Decision Intelligence
* 📊 Risk attribution & explainability
* 🔄 Recovery plan generation
* 📈 Scenario simulation engine
* 👥 Role-based authentication (JWT)
* 🔒 Secure project-level authorization
* 📡 RESTful APIs
* 📦 PostgreSQL + Prisma ORM
* ⚡ Redis integration
* 📝 Structured logging
* 🧪 Comprehensive test suite
* 🐳 Docker-ready deployment

---

# 🏛 System Architecture

```text
Public Signals + Project Data
            │
            ▼
Continuous Monitoring
            │
            ▼
Risk Prediction Engine
            │
            ▼
Risk Attribution Engine
            │
            ▼
Multi-Agent Intelligence Layer
 ├── Procurement Agent
 ├── Scheduling Agent
 ├── Resource Agent
 ├── Cost Agent
 ├── Quality Agent
 └── Risk Agent
            │
            ▼
Decision Orchestrator
            │
            ▼
Simulation Engine
            │
            ▼
Recovery Plan Generator
            │
            ▼
Human Approval
            │
            ▼
Knowledge Repository
```

---

# 🛠 Tech Stack

### Backend

* Node.js
* Express.js
* TypeScript
* Prisma ORM
* PostgreSQL
* Redis
* BullMQ

### AI

* OpenAI
* Anthropic
* Google Gemini

### DevOps

* Docker
* Jest
* ESLint
* Prettier

---

# 📂 Project Structure

```text
apps/
 ├── api/
 │    ├── modules/
 │    ├── services/
 │    ├── repositories/
 │    ├── middleware/
 │    ├── config/
 │    └── routes/
 │
 └── ai-service/

docs/

docker/

prisma/
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/the-piyushgoel/ConstructionIQ.git
cd ConstructionIQ
```

## Install

```bash
npm install
```

## Environment

```bash
cp .env.example .env
```

Configure:

* PostgreSQL
* Redis
* OpenAI API Key
* Anthropic API Key
* Gemini API Key
* JWT Secret

---

## Run

```bash
npm run dev
```

---

## Build

```bash
npm run build
```

---

## Test

```bash
npm test
```

---

# 🔐 Security

ConstructionIQ follows secure backend development practices:

* JWT Authentication
* Project Ownership Authorization
* Zod Validation
* Centralized Error Handling
* Input Sanitization
* Secure Environment Validation
* Principle of Least Privilege

---

# 📡 API Modules

* Authentication
* Projects
* Risk Events
* Predictions
* Recovery Plans
* Decision Intelligence
* Multi-Agent Orchestration

---

# 🧪 Quality Assurance

The project is continuously validated through:

* ESLint
* TypeScript Type Checking
* Jest Test Suite
* Production Build Verification

---

# 🎯 Future Improvements

* Real-time dashboard
* WebSocket notifications
* BIM integrations
* Cost forecasting
* Schedule optimization
* Analytics dashboards
* AI feedback learning loop

---

# 🤝 Contributing

Contributions, discussions, and suggestions are always welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Piyush Goel**

Computer Science Undergraduate • Full Stack Developer • Competitive Programmer

GitHub: https://github.com/the-piyushgoel

---

⭐ If you found this project interesting, consider giving it a star.