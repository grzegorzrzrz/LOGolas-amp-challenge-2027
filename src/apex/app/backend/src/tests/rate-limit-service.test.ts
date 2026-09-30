import rateLimitService from '../services/rate-limit-service.js';

// Mock environment variable for consistent testing
const originalEnv = process.env.RATE_LIMIT_MAX_REQUESTS;

describe('Rate Limit Service', () => {
    beforeEach(() => {
        // Set a consistent test value
        process.env.RATE_LIMIT_MAX_REQUESTS = '100';
    });

    afterEach(() => {
        // Restore original environment variable
        if (originalEnv) {
            process.env.RATE_LIMIT_MAX_REQUESTS = originalEnv;
        } else {
            delete process.env.RATE_LIMIT_MAX_REQUESTS;
        }
    });

    test('should allow first request', () => {
        const result = rateLimitService.checkRateLimit('192.168.1.1');
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(99); // First request counts as 1, so 100-1=99 remaining
    });

    test('should block after exceeding limit', () => {
        const ip = '192.168.1.2';
        const maxRequests = rateLimitService.getMaxRequests();
        
        // Make max requests
        for (let i = 0; i < maxRequests; i++) {
            rateLimitService.checkRateLimit(ip);
        }
        
        // Next request should be blocked
        const result = rateLimitService.checkRateLimit(ip);
        expect(result.allowed).toBe(false);
        expect(result.remaining).toBe(0);
    });

    test('should track multiple requests correctly', () => {
        const ip = '192.168.1.5';
        
        // First request
        let result = rateLimitService.checkRateLimit(ip);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(99);
        
        // Second request
        result = rateLimitService.checkRateLimit(ip);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(98);
        
        // Third request
        result = rateLimitService.checkRateLimit(ip);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(97);
    });

    test('should get correct rate limit info', () => {
        const ip = '192.168.1.3';
        const info = rateLimitService.getRateLimitInfo(ip);
        
        expect(info.allowed).toBe(true);
        expect(info.remaining).toBe(100);
    });

    test('should respect max requests configuration', () => {
        const ip = '192.168.1.4';
        const maxRequests = rateLimitService.getMaxRequests();
        
        // Make exactly max requests - all should be allowed
        for (let i = 0; i < maxRequests; i++) {
            const result = rateLimitService.checkRateLimit(ip);
            expect(result.allowed).toBe(true);
        }
        
        // Next request should be blocked
        const blockedResult = rateLimitService.checkRateLimit(ip);
        expect(blockedResult.allowed).toBe(false);
        expect(blockedResult.remaining).toBe(0);
    });
}); 