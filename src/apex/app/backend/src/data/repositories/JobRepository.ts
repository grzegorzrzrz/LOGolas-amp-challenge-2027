import { JobStatus } from '../../models/Job.js';
import db from '../db.js';

/**
 * Type for job with adjusted dates
 * This aligns the Prisma types with our domain model
 */
export type Job = {
  id: string;
  inputFilePath: string;
  outputFilePath: string | null;
  status: JobStatus;
  lsfJobId: string | null;
  errorMessage: string | null;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type JobUpsertData = {
  inputFilePath: string;
  outputFilePath: string | null;
  status: JobStatus;
  lsfJobId: string | null;
  errorMessage: string | null;
  email: string | null;
};

const saveJob = async (job: Job): Promise<void> => {
  const prisma = db.getInstance();
  const data: JobUpsertData = {
    inputFilePath: job.inputFilePath,
    outputFilePath: job.outputFilePath,
    status: job.status,
    lsfJobId: job.lsfJobId,
    errorMessage: job.errorMessage,
    email: job.email
  };
  
  await prisma.job.upsert({
    where: { id: job.id },
    update: {
      ...data,
      updatedAt: new Date()
    },
    create: {
      id: job.id,
      ...data
    }
  });
};

const getJobById = async (jobId: string): Promise<Job | null> => {
  const prisma = db.getInstance();
  const job = await prisma.job.findUnique({
    where: { id: jobId }
  });
  
  return job as Job | null;
};

const getPendingOrRunningJobs = async (): Promise<Job[]> => {
  const prisma = db.getInstance();
  const jobs = await prisma.job.findMany({
    where: {
      status: {
        notIn: [JobStatus.COMPLETED, JobStatus.FAILED]
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  return jobs as Job[];
};

const getAllJobs = async (): Promise<Job[]> => {
  const prisma = db.getInstance();
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: 'desc' }
  });
  
  return jobs as Job[];
};

const jobRepository = {
  saveJob,
  getJobById,
  getPendingOrRunningJobs,
  getAllJobs
};

export default jobRepository; 