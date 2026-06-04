# K-Maths LMS — Phase 1

A full-stack Learning Management System for O/L Mathematics students built with **React + MUI** (frontend) and **Node.js + Express + PostgreSQL** (backend).

---

## 🗂 Project Structure

```
k-maths/
├── backend/                  # Express API
│   ├── src/
│   │   ├── config/db.js      # PostgreSQL pool
│   │   ├── controllers/      # Business logic (8 controllers)
│   │   ├── middleware/       # auth, error, upload
│   │   ├── routes/           # REST routes (8 files)
│   │   └── utils/            # JWT, S3 helpers
│   ├── schema.sql            # Full DB schema + seed
│   ├── .env.example
│   └── package.json
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── api/              # Axios client + all API services
│   │   ├── app/              # Redux store + slices
│   │   ├── components/       # Shared UI components
│   │   │   ├── common/       # Layouts, ProtectedRoute, StatCard
│   │   │   ├── video/        # HLS VideoPlayer
│   │   │   ├── quiz/         # QuizRunner engine
│   │   │   └── charts/       # Recharts wrappers
│   │   ├── hooks/            # useAuth, custom hooks
│   │   ├── pages/
│   │   │   ├── auth/         # Login, Register
│   │   │   ├── student/      # 9 student pages
│   │   │   └── admin/        # 8 admin pages
│   │   ├── theme/            # MUI theme
│   │   └── utils/            # formatDate, currency helpers
│   └── package.json
└── docker-compose.yml
```

---

## 🚀 Quick Start (Docker — recommended)

```bash
# 1. Clone and enter the project
cd k-maths

# 2. Copy env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Edit backend/.env — set your AWS S3 keys, JWT secrets, SMTP

# 4. Start everything
docker-compose up --build

# API:      http://localhost:5000
# Frontend: http://localhost:3000
# DB:       localhost:5432 (postgres/postgres)
```

> The schema is auto-applied on first run. Default admin: `admin@k-maths.lk` / `Admin@123`

---

## 🛠 Manual Setup (without Docker)

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- AWS S3 bucket (for video/file storage)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials

# Create DB and run schema
createdb kmaths_db
psql -d kmaths_db -f schema.sql

npm run dev          # Starts on :5000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# REACT_APP_API_URL=http://localhost:5000/api

npm start            # Starts on :3000
```

---

## 🔐 Authentication Flow

| Step | Endpoint | Details |
|---|---|---|
| Register | `POST /api/auth/register` | Returns access + refresh tokens |
| Login    | `POST /api/auth/login`    | Returns access + refresh tokens |
| Refresh  | `POST /api/auth/refresh`  | Rotates both tokens |
| Logout   | `POST /api/auth/logout`   | Revokes refresh token |

- Access tokens expire in **15 minutes**
- Refresh tokens expire in **7 days** and are stored in PostgreSQL
- The Axios client auto-refreshes on 401 with token rotation

---

## 📡 API Reference

### Auth
| Method | Path | Auth |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/refresh` | Public |
| GET  | `/api/auth/me` | Bearer |
| PATCH| `/api/auth/me` | Bearer |

### Courses
| Method | Path | Role |
|---|---|---|
| GET    | `/api/courses` | Any |
| GET    | `/api/courses/mine` | Student |
| POST   | `/api/courses` | Admin |
| PATCH  | `/api/courses/:id` | Admin |
| DELETE | `/api/courses/:id` | Admin |

### Lessons
| Method | Path | Role |
|---|---|---|
| GET  | `/api/lessons/course/:courseId` | Any |
| GET  | `/api/lessons/:id/video-url` | Enrolled |
| POST | `/api/lessons` | Admin |
| POST | `/api/lessons/:id/upload` | Admin |

### Enrollments & Payments
| Method | Path | Role |
|---|---|---|
| POST  | `/api/enrollments` | Student |
| GET   | `/api/enrollments/mine` | Student |
| POST  | `/api/payments/initiate` | Student |
| POST  | `/api/payments/webhook` | Gateway |
| GET   | `/api/payments/admin/summary` | Admin |

### Quizzes
| Method | Path | Role |
|---|---|---|
| GET  | `/api/quizzes/:id` | Enrolled |
| POST | `/api/quizzes/:id/submit` | Enrolled |
| GET  | `/api/quizzes/progress/me` | Student |
| POST | `/api/quizzes/admin/create` | Admin |

### Admin Analytics
| Method | Path | Role |
|---|---|---|
| GET | `/api/admin/analytics/overview` | Admin |
| GET | `/api/admin/analytics/engagement` | Admin |
| GET | `/api/admin/users` | Admin |

---

## 💳 Payment Gateway Integration

The payment flow is ready for integration. To connect **Stripe**:

```js
// backend/src/controllers/payment.controller.js
// In initiatePayment(), after creating the pending record:
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{ price_data: { currency: 'lkr', unit_amount: amount * 100,
    product_data: { name: course.title } }, quantity: 1 }],
  mode: 'payment',
  success_url: `${process.env.CLIENT_URL}/payments?success=true`,
  cancel_url: `${process.env.CLIENT_URL}/payments`,
  metadata: { payment_id: rows[0].id },
});
res.json({ checkout_url: session.url });
```

For **PayHere** (Sri Lanka local gateway), replace the session creation with PayHere's hash-based form redirect — the webhook handler is already structured to receive their callback.

---

## 📹 Video Delivery

Videos are stored in **S3** and served via **signed URLs** (15-min expiry). The `VideoPlayer` component supports:
- **HLS** (`.m3u8`) via `hls.js` for adaptive bitrate streaming
- **MP4** direct playback
- **Safari** native HLS

For bandwidth-optimised delivery, transcode uploads to HLS using **AWS MediaConvert** or **FFmpeg** before storing:

```bash
ffmpeg -i input.mp4 \
  -profile:v baseline -level 3.0 \
  -start_number 0 -hls_time 10 \
  -hls_list_size 0 -f hls output.m3u8
```

---

## 🗃 Database Schema

Key tables and their relationships:

```
users ──< enrollments >── courses ──< lessons
               │                        │
               └──< payments            └──< quizzes ──< quiz_questions
                                               │
                                    quiz_attempts >── users
users ──< attendance >── lessons
courses ──< resources
courses ──< assignments ──< assignment_submissions
```

---

## 🔧 Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Access token signing secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | Refresh token signing secret |
| `AWS_ACCESS_KEY_ID` | S3 credentials |
| `AWS_SECRET_ACCESS_KEY` | S3 credentials |
| `AWS_S3_BUCKET` | S3 bucket name |
| `AWS_REGION` | e.g. `ap-southeast-1` |
| `SMTP_HOST` / `SMTP_PASS` | Email provider |
| `CLIENT_URL` | Frontend URL for CORS |

### Frontend (`frontend/.env`)
| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | Backend API base URL |

---

## 📦 Phase 2 Roadmap

- [ ] Email notifications (fee reminders, quiz results)
- [ ] PDF receipt generation (`pdf-lib`)
- [ ] Zoom SDK live class integration
- [ ] Mistake heatmap (weak-area radar on dashboard)
- [ ] Snap & Solve (photo assignment upload with annotation)
- [ ] Gamification — XP streaks, leaderboard
- [ ] Parent portal view
- [ ] Mobile PWA manifest
- [ ] BullMQ background jobs for email queue
- [ ] AWS CloudFront CDN for video delivery

---

## 🧑‍💻 Default Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@k-maths.lk | Admin@123 |

> **Change the admin password immediately after first login.**

---

## 📄 License

MIT — free for personal and commercial use.
