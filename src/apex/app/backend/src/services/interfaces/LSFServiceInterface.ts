import { Job, JobResult } from "../../models/Job.js";

export interface LSFServiceInterface {
    submitJob(inputFilePath: string, outputDirectory: string): Promise<string>;

    isJobCompleted(job: Job): Promise<boolean>;

    getJobResult(job: Job): Promise<JobResult>;


    checkJobOutputExists(job: Job, outputDirectory: string): Promise<boolean>;

    findJobOutputFile(job: Job, outputDirectory: string): Promise<string | null>;
} 