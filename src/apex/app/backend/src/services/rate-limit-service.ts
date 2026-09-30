interface RateLimitEntry {
    count: number;
    resetTime: number;
}

interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetTime: number;
}

const rateLimitCache = new Map<string, RateLimitEntry>();

const getMaxRequests = (): number => {
    return Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;
};

const getWindowMs = (): number => {
    return 24 * 60 * 60 * 1000; // 24 hours in milliseconds
};

const cleanupExpiredEntries = (): void => {
    const now = Date.now();
    for (const [ip, entry] of rateLimitCache.entries()) {
        if (now > entry.resetTime) {
            rateLimitCache.delete(ip);
        }
    }
};

const getClientIP = (ctx: any): string => {
    // Try to get IP from various headers (for proxy scenarios)
    return ctx.request.ip || 
           ctx.request.headers['x-forwarded-for']?.split(',')[0] || 
           ctx.request.headers['x-real-ip'] || 
           'unknown';
};

const checkRateLimit = (ip: string): RateLimitResult => {
    const now = Date.now();
    const windowMs = getWindowMs();
    const maxRequests = getMaxRequests();
    
    // Clean up expired entries periodically
    if (Math.random() < 0.01) { // 1% chance to clean up
        cleanupExpiredEntries();
    }
    
    const entry = rateLimitCache.get(ip);
    
    if (!entry || now > entry.resetTime) {
        // First request or window expired
        const newEntry: RateLimitEntry = {
            count: 1,
            resetTime: now + windowMs
        };
        rateLimitCache.set(ip, newEntry);
        
        return {
            allowed: true,
            remaining: maxRequests - 1,
            resetTime: newEntry.resetTime
        };
    }
    
    if (entry.count >= maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            resetTime: entry.resetTime
        };
    }
    
    // Increment count
    entry.count++;
    rateLimitCache.set(ip, entry);
    
    return {
        allowed: true,
        remaining: maxRequests - entry.count,
        resetTime: entry.resetTime
    };
};

const getRateLimitInfo = (ip: string): RateLimitResult => {
    const entry = rateLimitCache.get(ip);
    const maxRequests = getMaxRequests();
    
    if (!entry) {
        return {
            allowed: true,
            remaining: maxRequests,
            resetTime: Date.now() + getWindowMs()
        };
    }
    
    return {
        allowed: entry.count < maxRequests,
        remaining: Math.max(0, maxRequests - entry.count),
        resetTime: entry.resetTime
    };
};

export default {
    checkRateLimit,
    getRateLimitInfo,
    getMaxRequests,
    getWindowMs
}; 