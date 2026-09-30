import jobService from "../services/job-service.js";
import mockLsfService from '../services/mock-LSF-service.js';
import { JobStatus } from '../models/Job.js';
import fs from 'fs/promises';
import path from 'path';
import { testInputFolder, testOutputFolder } from './test-utils.js';

describe('Job Service', () => {
    beforeEach(async () => {
        await fs.mkdir(testInputFolder, { recursive: true });
        await fs.mkdir(testOutputFolder, { recursive: true });
    });
    
    afterEach(async () => {
        await fs.rm(testInputFolder, { recursive: true, force: true }).catch(console.warn);
        await fs.rm(testOutputFolder, { recursive: true, force: true }).catch(console.warn);
    });
    
    describe('submitJob', () => {
        it('should submit a job and return job record', async () => {
            const job = await jobService.submitJob({
                sequence: 'ATGC',
                name: 'test',
                email: 'test@example.com'
            });
            
            expect(job).toBeDefined();
            expect(job.id).toBeDefined();
            expect(job.inputFilePath).toBeDefined();
            expect(job.inputFilePath.startsWith(testInputFolder)).toBe(true);
            expect(job.status).toBe(JobStatus.PENDING);
            expect(job.lsfJobId).toBeDefined();
            expect(job.email).toBe('test@example.com');
        });
        
        it('should handle invalid sequence submission', async () => {
            await expect(jobService.submitJob({
                sequence: 'INVALIDzzxcc',
                name: 'test'
            })).rejects.toThrow();
        });
    });
    
    describe('job retrieval', () => {
        let submittedJob: any;
        
        beforeEach(async () => {
            submittedJob = await jobService.submitJob({
                sequence: 'ATGC',
                name: 'test'
            });
        });
        
        it('should get job by ID', async () => {
            const retrievedJob = await jobService.getJobById(submittedJob.id);
            expect(retrievedJob).toBeDefined();
            expect(retrievedJob?.id).toBe(submittedJob.id);
        });
        
        it('should return null for non-existent job ID', async () => {
            const job = await jobService.getJobById('non-existent-id');
            expect(job).toBeNull();
        });
        
        it('should get all jobs', async () => {
            await jobService.submitJob({ sequence: 'ATGC' });
            await jobService.submitJob({ sequence: 'ATGC' });
            
            const allJobs = await jobService.getAllJobs();
            expect(Array.isArray(allJobs)).toBe(true);
            expect(allJobs.length).toBeGreaterThanOrEqual(2);
        });
    });
    
    describe('job status updates', () => {
        it('should update job status through completion', async () => {
            const job = await jobService.submitJob({
                sequence: 'ATGC',
                name: 'test'
            });
            
            const waitForCompletion = async () => {
                for (let i = 0; i < 10; i++) {
                    const updatedJob = await jobService.updateJobStatus(job);
                    if (updatedJob.status === JobStatus.COMPLETED) {
                        expect(updatedJob.outputFilePath?.startsWith(testOutputFolder)).toBe(true);
                        return updatedJob;
                    }
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
                throw new Error('Job did not complete in time');
            };
            
            const completedJob = await waitForCompletion();
            expect(completedJob.status).toBe(JobStatus.COMPLETED);
            expect(completedJob.outputFilePath).toBeDefined();
        });
        
        it('should not update completed jobs', async () => {
            const job = await jobService.submitJob({
                sequence: 'ATGC',
                name: 'test'
            });
            
            const completedJob = {
                ...job,
                status: JobStatus.COMPLETED,
                outputFilePath: path.join(testOutputFolder, 'test.txt')
            };
            
            const updatedJob = await jobService.updateJobStatus(completedJob);
            expect(updatedJob).toEqual(completedJob);
        });
    });
}); 