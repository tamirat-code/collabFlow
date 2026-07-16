# CollabFlow

A full-stack, real-time project management platform built with the MERN stack. CollabFlow goes beyond a standard Kanban clone with live collaboration features, an AI assistant that can act on your behalf, and a full decision-history audit trail.

**Live app:** https://collab-flow-kappa.vercel.app
**API:** https://collabflow-api-m31x.onrender.com

---

## Why CollabFlow is different

Most project management tools stop at drag-and-drop boards. CollabFlow adds four things that genuinely change how a team works together:

- **Live presence with intent** — see exactly who else is viewing the same task as you, in real time, with a hoverable list of names and avatars (not just a generic "online" dot).
- **Decision-aware activity log** — moving a task backward or deleting it requires a short reason. Every regression and deletion is logged with that reason, turning the activity feed into a searchable record of *why* decisions were made, not just *what* changed.
- **Ghost Mode** — scrub a timeline slider to replay a project's entire history, watching tasks move between columns exactly as they did, day by day, like a time-lapse.
- **AI Assistant** — a full-page, context-aware chat assistant (powered by Groq) that knows your workspace's projects, tasks, deadlines, and members, and can actually create, move, assign, or delete tasks on your behalf — not just answer questions about them.

---

## Tech stack

**Frontend**
- React (Vite)
- Tailwind CSS
- Zustand — client-side state (auth, active workspace/project)
- TanStack Query — server state, caching, optimistic updates
- React Hook Form + Zod — form handling and validation
- Framer Motion — auth page transitions
- @dnd-kit — drag-and-drop Kanban board
- Recharts — analytics dashboard
- Socket.io-client — real-time sync

**Backend**
- Node.js + Express
- MongoDB + Mongoose (hosted on MongoDB Atlas)
- Socket.io — real-time task sync, live presence
- Passport.js — Google OAuth
- JWT — access + refresh token authentication
- Cloudinary — avatar and file attachment storage
- Stripe — subscription billing (Free / Pro / Business tiers)
- Groq (`llama-3.1-8b-instant`) — AI assistant and task suggestions
- Resend — transactional email (verification, password reset)
- express-rate-limit — per-route rate limiting

**Deployment**
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas
- File storage: Cloudinary

---

## Core features

### Authentication & accounts
- Email/password registration with email verification (Resend)
- Google OAuth sign-in
- JWT access tokens with httpOnly refresh token cookies, auto-refresh on expiry
- Forgot/reset password flow with styled HTML emails
- Profile management: bio-data, avatar upload, password change, account deletion (with cascading cleanup of owned workspaces)

### Workspaces & projects
- Multi-workspace support, each with its own members and roles
- Role-based access control: **admin**, **member**, **viewer**
- Invite members by email with a specific role
- Per-plan limits on projects and members, enforced server-side

### Kanban board
- Drag-and-drop tasks across To Do / In Progress / Done (`@dnd-kit`)
- Task priority, due dates, assignees, descriptions
- Comments and a full activity log per task
- File attachments (images, PDFs, docs, audio, video) via Cloudinary, with client- and server-side validation
- CSV/JSON export of a project's tasks

### Real-time collaboration
- Socket.io-powered live sync — task creates, moves, updates, and deletes appear instantly for every connected teammate
- Live presence indicators showing who else is viewing a task right now
- In-app and email notifications

### Decision history
- Moving a task backward or deleting it prompts for a reason, which is saved to that task's activity log
- Makes retros and audits meaningful — the history explains *why*, not just *when*

### Ghost Mode
- Full project history reconstructed from the activity log
- Scrub through time and watch the board replay itself

### AI Assistant
- Full-page chat interface, gated to Pro/Business plans
- Aware of the current workspace's projects, tasks, statuses, priorities, and members
- Can create, move, reassign, and delete tasks directly from natural language, with the same reason-required rules as manual actions
- Two-pass architecture (JSON-mode action detection, then a grounded confirmation reply) to avoid the model claiming to have done something it didn't

### Analytics
- Task counts by status and priority
- Completion rate, overdue tasks, task activity over the last 14 days
- Top assignees, tasks per project

### Billing
- Stripe Checkout for Free / Pro / Business plans
- Customer portal for self-service subscription management
- Webhook-driven plan sync (`checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted`)

---

## Getting started locally

### Prerequisites
- Node.js 20+
- A MongoDB instance (local or Atlas)
- Accounts/API keys for: Google OAuth, Cloudinary, Stripe, Groq, Resend

### Backend

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/collabflow
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
CLIENT_URL=http://localhost:5173
SESSION_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SERVER_URL=http://localhost:5000

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

STRIPE_SECRET_KEY=
STRIPE_PRICE_PRO=
STRIPE_PRICE_BUSINESS=
STRIPE_WEBHOOK_SECRET=

GROQ_API_KEY=

RESEND_API_KEY=
EMAIL_FROM=CollabFlow <onboarding@resend.dev>
```

```bash
npm run dev
```

### Frontend

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

```bash
npm run dev
```

Visit `http://localhost:5173`.

---

## Project structure

```
collabflow/
├── client/
│   └── src/
│       ├── api/            # fetchClient (auth-aware API wrapper)
│       ├── components/     # Sidebar, AppLayout, Kanban, modals, skeletons
│       ├── hooks/           # TanStack Query hooks per resource
│       ├── lib/              # socket connection, validation schemas
│       ├── pages/           # route-level pages
│       └── store/            # Zustand stores (auth, workspace, toast)
└── server/
    ├── config/              # Passport, Cloudinary
    ├── controllers/
    ├── middleware/          # auth, roles, plan limits, rate limiting
    ├── models/
    ├── routes/
    ├── utils/               # email, AI service, tokens
    └── socket.js            # Socket.io server + presence tracking
```

---

## Notes on architecture decisions

- **Zustand vs Redux**: Zustand was chosen for its minimal boilerplate — the app's client-side state (auth session, active workspace/project) is small enough that a full Redux setup would be unnecessary overhead.
- **TanStack Query for server state**: rather than storing server data in Zustand, all API data is cached and synchronized through TanStack Query, which handles background refetching, optimistic updates (used for drag-and-drop), and cache invalidation after mutations.
- **Two-pass AI architecture**: the assistant's action-taking is split into a JSON-mode "detect the action" call and a separate grounded "confirm what happened" call, rather than asking one model call to both act and narrate — this avoids the model hallucinating success when no action was actually taken.
- **Reason-required activity log**: implemented as a single reusable modal and a shared `statusRank` regression check, applied consistently whether the action comes from manual drag-and-drop or the AI assistant.

---

## License

This project was built as a personal portfolio/learning project.
