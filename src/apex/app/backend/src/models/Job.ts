export enum JobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// This interface defines our domain model
// The repository will handle conversion to/from Prisma models
export interface Job {
  id: string;
  inputFilePath: string;
  outputFilePath: string | null;
  status: JobStatus;
  lsfJobId: string | null;
  errorMessage: string | null;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateJobInput = {
  sequence: string;
  name?: string;
  email?: string;
};

export type JobResult = {
  status: JobStatus;
  errorMessage?: string;
}; 