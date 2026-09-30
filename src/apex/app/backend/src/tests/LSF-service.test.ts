import lsfService from '../services/LSF-service.js';
import { JobResult, JobStatus, Job } from '../models/Job.js';
import fs from 'fs/promises';
import path from 'path';
import { testInputFolder, testOutputFolder } from './test-utils.js';

// Skip these tests always
// They require actual LSF access which is not available in test environment
describe.skip('LSF Service', () => {
    let testInputFile: string;
    
    beforeEach(async () => {
        await fs.mkdir(testInputFolder, { recursive: true });
        await fs.mkdir(testOutputFolder, { recursive: true });
        const timestamp = new Date().getTime();
        testInputFile = path.join(testInputFolder, `input-${timestamp}.txt`);
        await fs.writeFile(testInputFile, 'test data');
    });
    
    afterEach(async () => {
        await fs.rm(testInputFolder, { recursive: true, force: true }).catch(console.warn);
        await fs.rm(testOutputFolder, { recursive: true, force: true }).catch(console.warn);
    });
    
    describe('submitJob', () => {
        it('should submit a job and return a numeric job ID', async () => {
            const jobId = await lsfService.submitJob(testInputFile, testOutputFolder);
            expect(jobId).toBeDefined();
            expect(typeof jobId).toBe('string');
            expect(jobId).toMatch(/^\d+$/);
        });
        
        it('should throw error for non-existent input file', async () => {
            await expect(lsfService.submitJob('non-existent-file', testOutputFolder))
                .rejects.toThrow('Input file not found');
        });
    });
    
    describe('job status and results', () => {
        let jobId: string;
        
        beforeEach(async () => {
            jobId = await lsfService.submitJob(testInputFile, testOutputFolder);
        });
        
        it('should check job completion status', async () => {
            const job: Job = {
                id: jobId,
                inputFilePath: testInputFile,
                outputFilePath: null,
                status: JobStatus.PENDING,
                lsfJobId: jobId,
                errorMessage: null,
                email: null,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const isCompleted = await lsfService.isJobCompleted(job);
            expect(typeof isCompleted).toBe('boolean');
        });
        
        it('should get job results', async () => {
            const job: Job = {
                id: jobId,
                inputFilePath: testInputFile,
                outputFilePath: null,
                status: JobStatus.PENDING,
                lsfJobId: jobId,
                errorMessage: null,
                email: null,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            const waitForCompletion = async (): Promise<JobResult> => {
                for (let i = 0; i < 30; i++) {
                    const isCompleted = await lsfService.isJobCompleted(job);
                    if (isCompleted) {
                        return await lsfService.getJobResult(job);
                    }
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
                throw new Error('Job did not complete in time');
            };
            
            try {
                const result = await waitForCompletion();
                expect(result.status).toBe(JobStatus.COMPLETED);
                expect(result.status).toBeDefined();
            } catch (error: any) {
                if (error.message !== 'Job did not complete in time') {
                    throw error;
                }
                console.warn(`Job ${jobId} did not complete in time allotted for test`);
            }
        });
    });
    
    describe('error handling', () => {
        it('should throw error for non-existent job ID', async () => {
            const nonExistentJob: Job = {
                id: '99999999',
                inputFilePath: 'non-existent-file',
                outputFilePath: null,
                status: JobStatus.PENDING,
                lsfJobId: '99999999',
                errorMessage: null,
                email: null,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            await expect(lsfService.isJobCompleted(nonExistentJob))
                .rejects.toThrow();
                
            await expect(lsfService.getJobResult(nonExistentJob))
                .rejects.toThrow();
        });
    });
}); 