import Router from '@koa/router';
import { Request } from 'koa';
import jobService from '../services/job-service.js';
import { CreateJobInput } from '../models/Job.js';
import { log } from "console";
import rateLimitMiddleware from '../middleware/rate-limit-middleware.js';

const router = new Router({ prefix: '/api/sequence' });

const handleSubmitSequence = async (ctx: Router.RouterContext) => {
    const body = ctx.request.body as { text: string, email: string };
    const text = body.text;
    const email = body.email;

    if (!email) {
        ctx.status = 400;
        ctx.body = { error: 'Email is required' };
        return;
    }
    
    if (!text) {
        ctx.status = 400;
        ctx.body = { error: 'Sequence text is required' };
        return;
    }

    if (text.length > 20000) {
        ctx.status = 400;
        ctx.body = { error: 'Sequence text exceeds the maximum limit of 20000 characters' };
        return;
    }

    const jobInput: CreateJobInput = { 
        sequence: text, 
        email: email 
    };
    const job = await jobService.submitJob(jobInput);
    
    ctx.status = 201;
    ctx.body = {
        jobId: job.id,
        status: job.status,
        message: 'Sequence submitted successfully'
    };
};

const handleSubmitSequenceFile = async (ctx: Router.RouterContext) => {
    // const file = formRequest.files?.file;
    const body = ctx.request.body as { email: string };
    const files = ctx.request.files as unknown as { buffer: Buffer }[];
    const email = body.email;
    const file = files[0];

    if (!file) {
        ctx.status = 400;
        ctx.body = { error: 'Sequence file is required' };
        return;
    }

    if (!email) {
        ctx.status = 400;
        ctx.body = { error: 'Email is required' };
        return;
    }

    try {
        // Read file content
        const sequence = file.buffer.toString('utf-8');
        
        const jobInput: CreateJobInput = { 
            sequence,
            email
        };
        const job = await jobService.submitJob(jobInput);
        
        ctx.status = 201;
        ctx.body = {
            jobId: job.id,
            status: job.status,
            message: 'Sequence file submitted successfully'
        };
    } catch (error) {
        ctx.status = 400;
        ctx.body = { error: 'Failed to read sequence file' };
    }
};

const handleGetJobStatus = async (ctx: Router.RouterContext) => {
    const { jobId } = ctx.params;
    
    if (!jobId) {
        ctx.status = 400;
        ctx.body = { error: 'Job ID is required' };
        return;
    }
    
    const job = await jobService.getJobById(jobId);
    if (!job) {
        ctx.status = 404;
        ctx.body = { error: 'Job not found' };
        return;
    }
    
    ctx.body = {
        jobId: job.id,
        status: job.status,
    };
};

router.post('/submit-text', rateLimitMiddleware, async (ctx) => {
    try {
        await handleSubmitSequence(ctx);
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: (error as Error).message };
    }
});

router.post('/submit-file', rateLimitMiddleware, async (ctx) => {
    try {
        await handleSubmitSequenceFile(ctx);
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: (error as Error).message };
    }
});

router.get('/:jobId', async (ctx) => {
    try {
        await handleGetJobStatus(ctx);
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: (error as Error).message };
    }
});

export default router; 