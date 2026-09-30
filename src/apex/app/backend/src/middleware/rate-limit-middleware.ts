import { Context, Next } from 'koa';
import Router from '@koa/router';
import rateLimitService from '../services/rate-limit-service.js';

const getClientIP = (ctx: Context): string => {
    const forwardedFor = ctx.request.headers['x-forwarded-for'];
    const forwardedIP = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
    const realIP = Array.isArray(ctx.request.headers['x-real-ip']) ? ctx.request.headers['x-real-ip'][0] : ctx.request.headers['x-real-ip'];
    
    return ctx.request.ip || 
           (forwardedIP && typeof forwardedIP === 'string' ? forwardedIP.split(',')[0] : undefined) || 
           realIP || 
           'unknown';
};

const rateLimitMiddleware = async (ctx: Router.RouterContext, next: Next) => {
    const clientIP = getClientIP(ctx);
    const rateLimitResult = rateLimitService.checkRateLimit(clientIP);
    
    if (!rateLimitResult.allowed) {
        const resetTime = new Date(rateLimitResult.resetTime).toISOString();
        ctx.status = 429; // Too Many Requests
        ctx.body = {
            error: 'Rate limit exceeded',
            message: 'You have exceeded the maximum number of requests allowed in 24 hours. Please try again later.',
            resetTime,
            maxRequests: rateLimitService.getMaxRequests()
        };
        return;
    }
    
    // Add rate limit headers to response
    ctx.set('X-RateLimit-Limit', rateLimitService.getMaxRequests().toString());
    ctx.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    ctx.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());
    
    await next();
};

export default rateLimitMiddleware; 