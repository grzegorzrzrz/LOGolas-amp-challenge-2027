import { LSFServiceInterface } from './interfaces/LSFServiceInterface.js';
import { Job, JobResult, JobStatus } from '../models/Job.js';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

const submitJob = async (inputFilePath: string, outputFilePath: string): Promise<string> => {
    try {
        await fs.access(inputFilePath);
    } catch (error) {
        throw new Error(`Input file not found: ${inputFilePath}`);
    }
    
    const jobId = crypto.randomUUID();
    
    jobs.set(jobId, {
        id: jobId,
        inputFilePath,
        outputFilePath,
        completed: false,
        startTime: new Date()
    });
    
    void processMockJob(jobId);
    return jobId;
};

const isJobCompleted = async (job: Job): Promise<boolean> => {
    const mockJob = getJob(job.id);
    return mockJob.completed;
};

const getJobResult = async (job: Job): Promise<JobResult> => {
    const mockJob = getJob(job.id);
    
    if (!mockJob.completed) {
        return {
            status: JobStatus.RUNNING
        };
    }
    
    return {
        status: JobStatus.COMPLETED,
    };
};

const checkJobOutputExists = async (job: Job, outputDirectory: string): Promise<boolean> => {
    const mockJob = getJob(job.id);
    
    try {
        await fs.access(mockJob.outputFilePath);
        return true;
    } catch {
        return false;
    }
};

const findJobOutputFile = async (job: Job, outputDirectory: string): Promise<string | null> => {
    const mockJob = getJob(job.id);
    
    try {
        await fs.access(mockJob.outputFilePath);
        return mockJob.outputFilePath;
    } catch {
        return null;
    }
};

// Helper functions ----

const DEFAULT_PROCESSING_TIME_MS = 1000;

const jobs = new Map<string, {
    id: string;
    inputFilePath: string;
    outputFilePath: string;
    completed: boolean;
    startTime: Date;
}>();

const getJob = (jobId: string) => {
    const job = jobs.get(jobId);
    if (!job) {
        throw new Error('Job not found');
    }
    return job;
};


const processMockJob = async (jobId: string, processingTimeMs = DEFAULT_PROCESSING_TIME_MS): Promise<void> => {
    const job = getJob(jobId);
    
    await new Promise(resolve => setTimeout(resolve, processingTimeMs));
    
    try {
        const inputContent = await fs.readFile(job.inputFilePath, 'utf-8');
        const outputContent = `PROCESSED: ${inputContent}`;
        await fs.writeFile(job.outputFilePath, outputContent);
        job.completed = true;
    } catch (error) {
        job.completed = true;
    }
    
    jobs.set(jobId, job);
};

const mockLsfService: LSFServiceInterface = {
    submitJob,
    isJobCompleted,
    getJobResult,
    checkJobOutputExists,
    findJobOutputFile
};

export default mockLsfService; 