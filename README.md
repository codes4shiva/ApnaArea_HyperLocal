# 🏘️ ApnaArea — Hyperlocal Community Platform

> Connecting real neighbors. Building trusted communities.

**ApnaArea** is a hyperlocal neighborhood platform built for India,
inspired by Nextdoor. Residents join their locality, interact with
real verified neighbors, discover local events, buy/sell in the
neighborhood marketplace, and participate in community governance
— all tied to real identity (name + mobile number).

🔗 **Live Demo:** [apna-area-hyper-local.vercel.app](https://apna-area-hyper-local.vercel.app)

---

## ✨ Features

- 🔐 **Auth** — Register/Login with JWT (access + refresh tokens)
- 🏙️ **Neighborhoods** — Create or join localities by pincode
- 📰 **Community Feed** — Post, comment, like within your neighborhood
- 🛒 **Local Marketplace** — Buy/sell with verified neighbors
- 📅 **Neighborhood Events** — Create events, RSVP, attend
- 👤 **Public Profiles** — Real name, real identity, no anonymity
- 👥 **Follow System** — Follow neighbors, see their activity
- 💬 **Direct Messages** — DM any member (block feature included)
- 🚨 **Report System** — Report posts/comments, auto-hide on threshold
- 🛡️ **Role-Based Moderation** — Neighborhood creator becomes Moderator
  (Reddit-style), can promote Residents

---

## 🛠️ Tech Stack

### Frontend
| Tech | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Tailwind CSS | Styling |
| React Router v6 | Client-side routing |
| Axios | HTTP client |
| Vite | Build tool |

### Backend
| Tech | Purpose |
|---|---|
| Java 21 | Language |
| Spring Boot 3.3 | Framework |
| Spring Security + JWT | Authentication & Authorization |
| Spring Data JPA + Hibernate | ORM |
| PostgreSQL | Primary database |
| Flyway | Database migrations |
| MapStruct | DTO mapping |
| Redis | Caching |
| Lombok | Boilerplate reduction |
| SpringDoc OpenAPI | Swagger UI |

### Infrastructure
| Tech | Purpose |
|---|---|
| Docker + Docker Compose | Containerization |
| AWS EC2 + Nginx | Hosting & reverse proxy |
| GitHub Actions | CI/CD |
| Cloudinary | Image storage |
| Vercel | Frontend deployment |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Java 21
- PostgreSQL
- Redis

### Frontend Setup

```bash
# Clone the repo
git clone https://github.com/codes4shiva/ApnaArea_HyperLocal.git
cd ApnaArea_HyperLocal

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Add your GEMINI_API_KEY in .env.local

# Run development server
npm run dev
```

### Backend Setup

```bash
cd java-backend

# Configure your DB credentials in
# src/main/resources/application-local.yml

# Run with Maven
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

---

## 🔑 Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```env
# Gemini AI (required)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Backend API
VITE_API_BASE_URL=http://localhost:8080/api/v1

# Cloudinary (image uploads)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

> ⚠️ Never commit `.env.local` — it's in `.gitignore`

---
