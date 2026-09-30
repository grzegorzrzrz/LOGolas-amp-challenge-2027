import 'dotenv/config';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import pingRouter from './routes/ping-router.js';
import jobStatusPoller from './services/job-status-poller.js';
import cleanupScheduler from './services/cleanup-scheduler.js';
import sequenceRouter from './routes/sequence-router.js';
import lsfService from './services/LSF-service.js';
import multer from '@koa/multer';
import cors from '@koa/cors';
// @ts-ignore
import serve from 'koa-static';
import path from 'path';
import { fileURLToPath } from 'url';

const app = new Koa();
const PORT: number = Number(process.env.PORT) || 10000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

jobStatusPoller.init(lsfService);
cleanupScheduler.init();

// CORS configuration - only for development
const isDevelopment = process.env.NODE_ENV !== 'production';
if (isDevelopment) {
    app.use(cors({
        origin: 'http://localhost:10000',
        allowMethods: ['GET', 'POST'],
        allowHeaders: ['Content-Type']
    }));
}

const upload = multer({
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});

// Error handling middleware for multer file size errors
app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err: any) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            ctx.status = 413;
            ctx.body = { error: 'File size exceeds the maximum limit of 50MB' };
            return;
        }
        throw err;
    }
});

app.use(upload.any());
app.use(bodyParser());

// API routes
app.use(pingRouter.routes());
app.use(sequenceRouter.routes());

// Serve static files from frontend build
const frontendDistPath = path.join(__dirname, '..', '..', 'frontend', 'dist');
app.use(serve(frontendDistPath));

// Fallback to index.html for client-side routing (SPA)
app.use(async (ctx, next) => {
    // Only handle non-API routes
    if (!ctx.path.startsWith('/api/')) {
        ctx.path = '/index.html';
    }
    await next();
});

app.on('error', (err, ctx) => {
    console.error('Server error:', err);
});

const gracefulShutdown = () => {
    console.log('Shutting down gracefully...');
    jobStatusPoller.stop();
    cleanupScheduler.stop();
    process.exit(0);
};

process.on('SIGINT', gracefulShutdown)
process.on('SIGTERM', gracefulShutdown);


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`DATABASE_URL: ${process.env.DATABASE_URL || 'default'}`);
    jobStatusPoller.start();
    cleanupScheduler.start();
});