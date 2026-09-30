import cleanupService from './cleanup-service.js';

type CleanupScheduler = {
    init: (interval?: number) => void;
    start: () => void;
    stop: () => void;
};

type SchedulerState = {
    isRunning: boolean;
    intervalId: NodeJS.Timeout | null;
    intervalMs: number;
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const state: SchedulerState = {
    isRunning: false,
    intervalId: null,
    intervalMs: ONE_DAY_MS
};

const init = (interval: number = ONE_DAY_MS): void => {
    state.intervalMs = interval;
};

const start = async (): Promise<void> => {
    if (state.isRunning) return;

    state.isRunning = true;
    await cleanupService.cleanup();

    state.intervalId = setInterval(async () => {
        await cleanupService.cleanup();
    }, state.intervalMs);
};

const stop = (): void => {
    if (!state.isRunning) return;

    if (state.intervalId) {
        clearInterval(state.intervalId);
        state.intervalId = null;
    }

    state.isRunning = false;
};

const cleanupScheduler: CleanupScheduler = {
    init,
    start,
    stop
};

export default cleanupScheduler; 