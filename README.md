# 🏥 MediQueue — Hospital Queue Management System

A full-stack, mobile-friendly hospital queue management system with patient, doctor, and admin portals.

---

## 📁 Project Structure

```
hospital-queue/
├── backend/            # FastAPI + SQLite
│   ├── main.py         # All API routes & models
│   ├── requirements.txt
│   ├── render.yaml     # Render deployment config
│   └── .env.example
├── frontend/           # React + Vite + Tailwind
│   ├── src/
│   │   ├── api/        # Axios client
│   │   ├── components/ # Navbar, ProtectedRoute
│   │   ├── context/    # AuthContext
│   │   └── pages/      # All page components
│   ├── vercel.json     # Vercel deployment config
│   └── .env.example
└── README.md
```

---

## ✨ Features

### Patient Portal
- Register / Login
- Book a consultation token
- View token number and status
- Real-time queue position tracking
- Estimated wait time

### Doctor Dashboard
- View full queue (waiting + called)
- Call next patient (auto-completes previous)
- Pause / Resume the queue
- Skip absent patients

### Admin Panel
- View all registered patients
- View all tokens with status filter
- Live queue stats & analytics
- Reset queue (clears all tokens)

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| Backend | FastAPI, SQLAlchemy, SQLite |
| Auth | JWT (PyJWT), bcrypt |
| Hosting | Vercel (frontend) + Render (backend) |

---

## 🚀 Local Development

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy env
cp .env.example .env

# Run server
uvicorn main:app --reload --port 8000
```

API will be live at: `http://localhost:8000`
Interactive docs at: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy env
cp .env.example .env
# For local dev, you don't need to change anything — proxy handles it

# Run dev server
npm run dev
```

Frontend will be live at: `http://localhost:3000`

---

## ☁️ Deployment

### Step 1 — Deploy Backend to Render

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → **New → Web Service**
3. Connect your GitHub repo
4. Set **Root Directory** to `backend`
5. Render auto-detects `render.yaml` — confirm these settings:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add Environment Variables:
   - `SECRET_KEY` → click "Generate" for a secure value
   - `DATABASE_URL` → `sqlite:///./hospital.db`
7. Click **Create Web Service**
8. Copy your Render URL (e.g. `https://hospital-queue-backend.onrender.com`)

### Step 2 — Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Set **Root Directory** to `frontend`
4. Vercel auto-detects Vite
5. Add Environment Variable:
   - `VITE_API_URL` → your Render backend URL (from Step 1)
6. Click **Deploy**

That's it! Your app will be live on a `*.vercel.app` domain.

---

## 🔑 Demo Accounts

When you first start the backend, register accounts manually via `/register`, or use these credentials after seeding:

| Role | Email | Password |
|------|-------|----------|
| Patient | patient@demo.com | demo1234 |
| Doctor | doctor@demo.com | demo1234 |
| Admin | admin@demo.com | demo1234 |

> **Note:** The Login page has a "Quick Demo Login" shortcut to pre-fill these credentials.

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login and get JWT |
| GET | `/auth/me` | Get current user |

### Patient
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/tokens/book` | Book a new token |
| GET | `/tokens/my` | Get my tokens |
| GET | `/tokens/status/{number}` | Get token position & wait |
| GET | `/queue/status` | Public queue status |

### Doctor
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/doctor/queue` | View current queue |
| POST | `/doctor/call-next` | Call next patient |
| POST | `/doctor/pause` | Pause queue |
| POST | `/doctor/resume` | Resume queue |
| POST | `/doctor/skip/{number}` | Skip a token |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/patients` | All patients |
| GET | `/admin/tokens` | All tokens |
| GET | `/admin/stats` | Queue statistics |
| POST | `/admin/reset-queue` | Reset entire queue |

---

## 🎨 Design System

- **Color palette:** Teal accent on dark navy slate
- **Typography:** DM Serif Display (headings) + DM Sans (body) + JetBrains Mono (numbers)
- **Theme:** Deep dark with glass morphism cards
- **Animations:** Slide-up, fade-in, bounce-in, pulse indicators
- **Mobile-first:** Fully responsive, collapsible mobile nav

---

## 🔒 Security Notes

1. Change `SECRET_KEY` in production — never use the default
2. For production, consider PostgreSQL instead of SQLite (Render provides free Postgres)
3. Add HTTPS-only cookie flag if switching to cookie-based auth
4. Rate limit `/auth/login` to prevent brute force

## 📦 Production Database (Optional Upgrade)

To use PostgreSQL on Render:

1. Create a **Render PostgreSQL** database (free tier available)
2. Copy the **Internal Database URL**
3. Set `DATABASE_URL` env var to the PostgreSQL URL
4. SQLAlchemy handles the rest — no code changes needed

---

Made with ❤️ by MediQueue
