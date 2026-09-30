import mockLsfService from '../services/mock-LSF-service.js';
import { JobResult, JobStatus, Job } from '../models/Job.js';
import fs from 'fs/promises';
import path from 'path';
import { testInputFolder, testOutputFolder } from './test-utils.js';

describe('Mock LSF Service', () => {
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
        it('should submit a job and return a job ID', async () => {
            const jobId = await mockLsfService.submitJob(testInputFile, testOutputFolder);
            expect(jobId).toBeDefined();
            expect(typeof jobId).toBe('string');
        });

        it('should throw error for non-existent input file', async () => {
            await expect(mockLsfService.submitJob(path.join(testInputFolder, 'non-existent-file'), testOutputFolder))
                .rejects.toThrow('Input file not found');
        });
    });
    
    describe('job status and results', () => {
        let jobId: string;
        
        beforeEach(async () => {
            jobId = await mockLsfService.submitJob(testInputFile, testOutputFolder);
        });

        it('should initially report job as not completed', async () => {
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
            const isCompleted = await mockLsfService.isJobCompleted(job);
            expect(isCompleted).toBe(false);
        });
        
        it('should return running status for incomplete job', async () => {
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
            const result = await mockLsfService.getJobResult(job);
            expect(result.status).toBe('running');
        });

        it('should eventually complete the job', async () => {
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
            
            const waitForCompletion = async () => {
                for (let i = 0; i < 10; i++) {
                    if (await mockLsfService.isJobCompleted(job)) return true;
                    await new Promise(resolve => setTimeout(resolve, 600));
                }
                return false;
            };

            expect(await waitForCompletion()).toBe(true);
        });
        
        it('should provide job results after completion', async () => {
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
            
            const waitForResult = async (): Promise<JobResult> => {
                for (let i = 0; i < 20; i++) {
                    const result = await mockLsfService.getJobResult(job);
                    if (result.status === JobStatus.COMPLETED) {
                        return result;
                    }
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
                throw new Error('Job did not complete in time');
            };

            const result = await waitForResult();
            expect(result.status).toBe(JobStatus.COMPLETED);
        });
    });
    
    describe('error handling', () => {
        it('should throw error for non-existent job ID', async () => {
            const nonExistentJob: Job = {
                id: 'non-existent-id',
                inputFilePath: 'non-existent-file',
                outputFilePath: null,
                status: JobStatus.PENDING,
                lsfJobId: 'non-existent-id',
                errorMessage: null,
                email: null,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            await expect(mockLsfService.isJobCompleted(nonExistentJob))
                .rejects.toThrow('Job not found');
                
            await expect(mockLsfService.getJobResult(nonExistentJob))
                .rejects.toThrow('Job not found');
        });
    });
}); 