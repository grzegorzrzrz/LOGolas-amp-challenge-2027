import jobService from './job-service.js';
import { LSFServiceInterface } from './interfaces/LSFServiceInterface.js';
import jobRepository from "../data/repositories/JobRepository.js";

type JobStatusPoller = {
    init: (lsfServiceInstance: LSFServiceInterface, interval?: number) => void;
    start: () => void;
    stop: () => void;
    pollJobs: () => Promise<void>;
};

type PollerState = {
    isPolling: boolean;
    intervalId: NodeJS.Timeout | null;
    pollIntervalMs: number;
    lsfService: LSFServiceInterface | null;
};

const state: PollerState = {
    isPolling: false,
    intervalId: null,
    pollIntervalMs: 30000,
    lsfService: null
};

const init = (lsfServiceInstance: LSFServiceInterface, interval: number = 30000): void => {
    state.lsfService = lsfServiceInstance;
    state.pollIntervalMs = interval;
};

const start = (): void => {
    if (state.isPolling) {
        console.warn('Job status poller is already running');
        return;
    }
    
    if (!state.lsfService) {
        throw new Error('JobStatusPoller not initialized. Call init() first');
    }
    
    console.info(`Starting job status poller (interval: ${state.pollIntervalMs}ms)`);
    
    state.isPolling = true;
    state.intervalId = setInterval(pollJobs, state.pollIntervalMs);
    
    pollJobs();
};

const stop = (): void => {
    if (!state.isPolling || !state.intervalId) {
        console.warn('Job status poller is not running');
        return;
    }
    
    console.info('Stopping job status poller');
    
    clearInterval(state.intervalId);
    state.isPolling = false;
    state.intervalId = null;
};

const pollJobs = async (): Promise<void> => {
    if (!state.lsfService) {
        throw new Error('JobStatusPoller not initialized. Call init() first');
    }
    
    console.info('Polling for job status updates...');
    const pendingJobs = await jobRepository.getPendingOrRunningJobs();
    console.info(`Found ${pendingJobs.length} pending/running jobs`);
    
    await Promise.all(pendingJobs.map(async job => {
        try {
            console.info(`Updating status of job ${job.id} with lsfJobId=${job.lsfJobId}...`);
            await jobService.updateJobStatus(job);
        } catch (error) {
            console.error(`Error updating job ${job.id}:`, error);
        }
    }));
};

const jobStatusPoller: JobStatusPoller = {
    init,
    start,
    stop,
    pollJobs
};

export default jobStatusPoller; 