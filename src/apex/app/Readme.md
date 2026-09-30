Please check documentation folder for extra info about deployment.

## Development

This project supports multiple development approaches, each with different trade-offs. Choose the one that best fits your workflow.

### Approach 1: Production Build & Start (Root)

**Commands:**
```bash
npm run build
npm run start
```

**How it works:**
- Builds both frontend and backend from the root directory
- Starts the backend server in production mode (serves compiled JavaScript)

**Pros:**
- ✅ Closest to production environment
- ✅ Starts frontend and backend on the same host
- ✅ Tests the actual build process
- ✅ Good for verifying production builds before deployment
- ✅ Single command to start after build

**Cons:**
- ❌ Slower feedback loop (requires full rebuild on changes)
- ❌ No hot reload for frontend or backend
- ❌ Must rebuild after every code change
- ❌ Not ideal for active development

---

### Approach 2: Concurrent Development (Root)

**Commands:**
```bash
npm run dev
```

**How it works:**
- Runs both frontend and backend in development mode concurrently
- Frontend uses `build:watch` (TypeScript compilation + Vite watch mode)
- Backend uses `tsx watch` (TypeScript with hot reload)

**Pros:**
- ✅ Single command to start everything\
- ✅ Starts frontend and backend on the same host
- ✅ Both services run simultaneously
- ✅ Backend has hot reload (TypeScript watch)
- ✅ Frontend rebuilds automatically on changes
- ✅ Convenient for full-stack development

**Cons:**
- ❌ Frontend uses build:watch (slower than Vite dev server)
- ❌ No Vite HMR (Hot Module Replacement) for frontend
- ❌ Frontend changes require full rebuild
- ❌ Requires `concurrently` package

---

### Approach 3: Separate Development Servers

**Commands:**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**How it works:**
- Backend runs with `tsx watch` (TypeScript hot reload)
- Frontend runs with Vite dev server (full HMR support)

**Prerequisites:**
- Frontend requires environment variable setup:
  1. Copy `.env example` to `.env` in the `frontend` folder
  2. Set `VITE_BACKEND_BASE_URL` to your backend URL (default: `https://localhost:10000`)

**Pros:**
- ✅ Fastest development experience
- ✅ Full Vite HMR for frontend (instant updates)
- ✅ Starts frontend and backend on different! hosts
- ✅ Backend hot reload with TypeScript
- ✅ Best developer experience
- ✅ Separate terminal output (easier debugging)
- ✅ Can run services independently

**Cons:**
- ❌ Requires two terminal windows/tabs
- ❌ Must manually start both services
- ❌ Requires environment variable configuration
- ❌ Slightly more setup

---

### Recommendation

- **For active development:** Use **Approach 3** (separate servers) for the best experience
- **For quick testing:** Use **Approach 2** (concurrent dev) for convenience
- **For production verification:** Use **Approach 1** (build & start)