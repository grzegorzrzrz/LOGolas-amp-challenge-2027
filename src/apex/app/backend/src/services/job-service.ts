import { LSFServiceInterface } from './interfaces/LSFServiceInterface.js';
import { JobStatus, CreateJobInput } from '../models/Job.js';
import lsfService from './LSF-service.js';
import emailService from './email-service.js';
import sequenceService from './sequence-service.js';
import jobRepository, { Job } from '../data/repositories/JobRepository.js';
import utils, { FOLDERS } from './utils.js';
import crypto from 'crypto';
import path from 'path';

const submitJob = async (jobInput: CreateJobInput): Promise<Job> => {
    const { inputDir, outputDir } = utils.getFileDirectories();
    const jobId = crypto.randomUUID();

    const inputFilePath = await sequenceService.saveAsFasta(
        jobInput.sequence, 
        `${jobId}.fasta`,
        inputDir
    );
    const outputFilePath = path.join(outputDir, `${jobId}.csv`);
    
    const lsfJobId = await lsfService.submitJob(inputFilePath, outputFilePath);
    
    const job: Job = {
        id: jobId,
        inputFilePath,
        outputFilePath,
        status: JobStatus.PENDING,
        lsfJobId,
        errorMessage: null,
        email: jobInput.email || null,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    await jobRepository.saveJob(job);
    return job;
};

const getJobById = async (jobId: string): Promise<Job | null> => 
    jobRepository.getJobById(jobId);

const getAllJobs = async (): Promise<Job[]> => 
    jobRepository.getAllJobs();

const updateJobStatus = async (job: Job): Promise<Job> => {
    if (job.status === JobStatus.COMPLETED || job.status === JobStatus.FAILED) {
        return job;
    }

    const isCompleted = await lsfService.isJobCompleted(job);
    if (!isCompleted) {
        return await updateRunningJob(job);
    }

    const result = await lsfService.getJobResult(job);
    const updatedJob = result.status === JobStatus.COMPLETED
        ? await handleCompletedJob(job)
        : await handleFailedJob(job, result.errorMessage);

    if (updatedJob.email) {
        await sendEmailNotification(updatedJob).catch(console.error);
    }

    return updatedJob;
};

// Helper functions ----

const updateRunningJob = async (job: Job): Promise<Job> => {
    const updatedJob = {
        ...job,
        status: JobStatus.RUNNING,
        updatedAt: new Date()
    };
    await jobRepository.saveJob(updatedJob);
    return updatedJob;
};

const handleCompletedJob = async (job: Job): Promise<Job> => {
    const updatedJob = {
        ...job,
        status: JobStatus.COMPLETED,
        updatedAt: new Date()
    };
    await jobRepository.saveJob(updatedJob);
    return updatedJob;
};

const handleFailedJob = async (job: Job, errorMessage?: string): Promise<Job> => {
    const updatedJob = {
        ...job,
        status: JobStatus.FAILED,
        errorMessage: errorMessage || null,
        updatedAt: new Date()
    };
    await jobRepository.saveJob(updatedJob);
    return updatedJob;
};

const sendEmailNotification = async (job: Job): Promise<void> => {
    if (!job.email) return;

    const outputFile = job.status === JobStatus.COMPLETED && job.outputFilePath
        ? job.outputFilePath
        : undefined;

    await emailService.sendJobCompletionNotification(
        job.email,
        job.id,
        job.status,
        outputFile
    );
};

const jobService = {
    submitJob,
    getJobById,
    getAllJobs,
    updateJobStatus
};

export default jobService; 