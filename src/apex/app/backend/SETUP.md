# Backend Serve Frontend Setup

This backend now serves the React frontend and provides API routes with `/api/` prefix.

## Development Mode

1. **Frontend Development Server**: Run the frontend on Vite dev server (port 5173)
   ```bash
   cd frontend
   npm run dev
   ```

2. **Backend Development Server**: Run the backend (port 10000)
   ```bash
   npm run dev
   ```

3. **Environment Variables**: Create `frontend/.env` with:
   ```
   VITE_BACKEND_BASE_URL=http://localhost:10000
   ```

## Production Mode

1. **Build Frontend**: The frontend will be built to `frontend/dist/`
   ```bash
   cd frontend
   npm run build
   ```

2. **Build Backend**: Builds both frontend and backend
   ```bash
   npm run build
   ```

3. **Start Production Server**: Serves frontend and API on same port
   ```bash
   npm start
   ```

## API Routes

All API routes are now prefixed with `/api/`:

- `GET /api/ping` - Health check
- `POST /api/sequence/submit-text` - Submit sequence as text
- `POST /api/sequence/submit-file` - Submit sequence as file
- `GET /api/sequence/:jobId` - Get job status

## Frontend Routes

The backend serves the React app on `/` and handles client-side routing by serving `index.html` for non-API routes.

## CORS Configuration

- **Development**: CORS enabled for `http://localhost:5173`
- **Production**: No CORS needed (same origin)
