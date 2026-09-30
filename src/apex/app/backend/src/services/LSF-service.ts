import { LSFServiceInterface } from './interfaces/LSFServiceInterface.js';
import { Job, JobResult, JobStatus } from '../models/Job.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import mockLsfService from "./mock-LSF-service.js";

const execAsync = promisify(exec);
const profileLsf = `source /lsf/conf/profile.lsf && source /appl/Modules/current/init/bash && module use /appl/Modules/CentOS7 && module use /appl/Modules/RHEL9 && module load tensorflow`;

const submitJob = async (inputFilePath: string, outputFilePath: string): Promise<string> => {
    await fs.access(inputFilePath);

    const command = createSubmitCommand(inputFilePath, outputFilePath);
    const lsfJobId = await submitToLSF(command);

    return lsfJobId;
};

const isJobCompleted = async (job: Job): Promise<boolean> => {
    const result = await getJobResult(job);
    return result.status === JobStatus.COMPLETED || result.status === JobStatus.FAILED;
};

const getJobResult = async (job: Job): Promise<JobResult> => {
    if (!job.lsfJobId) {
        throw new Error('LSF Job ID not present for jobId=' + job.id);
    }
    const { stdout } = await execAsync(`${profileLsf} && bjobs -noheader ${job.lsfJobId}`);
    if (stdout.trim() === ''){
        return {
            status: JobStatus.COMPLETED,
        }
    } 
    if (stdout.includes('EXIT')) {
        return {
            status: JobStatus.FAILED,
            errorMessage: 'Job failed, check LSF logs for details'
        }
    }
    if (stdout.includes('DONE')) {
        return {
            status: JobStatus.COMPLETED,
        }
    }

    // Job is still running
    return {
        status: JobStatus.RUNNING,
    }
};

const checkJobOutputExists = async (job: Job, outputDirectory: string): Promise<boolean> => {
    const outputFilePath = await findJobOutputFile(job, outputDirectory);
    if (!outputFilePath) return false;

    try {
        await fs.access(outputFilePath);
        return true;
    } catch {
        return false;
    }
};

const findJobOutputFile = async (job: Job, outputDirectory: string): Promise<string | null> => {
    try {
        const result = await fs.stat(job.outputFilePath as string);
        console.log("path=", job.outputFilePath, "size=", result.size);
        if (result.isFile() && result.size > 0) {
            return job.outputFilePath as string;
        }
        return null;
    } catch {
        return null;
    }
};

// Helper functions ----

const createSubmitCommand = (inputFilePath: string, outputFilePath: string): string => {
    return `${profileLsf} && bsub -q 9_lpcgpu -gpu num=1 -e /project/apexgpu_shared/logs/%J.err -o /project/apexgpu_shared/logs/%J.out python /project/apexgpu_shared/apex1.1/APEX_predict.py -i ${inputFilePath} -o ${outputFilePath}`;
};

const submitToLSF = async (command: string): Promise<string> => {
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr && !stdout) {
        throw new Error(`LSF submission error: ${stderr}`);
    }

    const jobIdMatch = stdout.match(/Job <(\d+)>/);
    if (!jobIdMatch?.[1]) {
        throw new Error(`Could not parse job ID from LSF output: ${stdout}`);
    }

    return jobIdMatch[1];
};

const checkJobLogStatus = async (logFilePath: string): Promise<{ failed: boolean }> => {
    try {
        const logContent = await fs.readFile(logFilePath, 'utf-8');
        return { failed: logContent.includes('ERROR') || logContent.includes('FAILED') };
    } catch {
        return { failed: true };
    }
};

const lsfService: LSFServiceInterface = {
    submitJob,
    isJobCompleted,
    getJobResult,
    checkJobOutputExists,
    findJobOutputFile
};

const useMockLsf = false;

export default useMockLsf ? mockLsfService : lsfService;