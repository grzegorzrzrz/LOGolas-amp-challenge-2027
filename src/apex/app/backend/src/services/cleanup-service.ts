import fs from 'fs/promises';
import path from 'path';

const DEFAULT_RETENTION_DAYS = 7;

const cleanup = async (): Promise<void> => {
    const basePath = process.env.LSF_CLUSTER_BASE_PATH;
    if (!basePath) {
        throw new Error('LSF_CLUSTER_BASE_PATH environment variable is not set');
    }

    const retentionDays = process.env.FILE_CLEANUP_PERIOD_DAYS 
        ? parseInt(process.env.FILE_CLEANUP_PERIOD_DAYS, 10)
        : DEFAULT_RETENTION_DAYS;

    const inputDir = path.join(basePath, 'input');
    const outputDir = path.join(basePath, 'output');

    await Promise.all([
        cleanupDirectory(inputDir, retentionDays),
        cleanupDirectory(outputDir, retentionDays)
    ]);
};

// Helper functions ----

const cleanupDirectory = async (directory: string, retentionDays: number): Promise<void> => {
    try {
        const files = await fs.readdir(directory);
        const now = new Date();
        const cutoffDate = new Date(now.setDate(now.getDate() - retentionDays));

        await Promise.all(files.map(async (file) => {
            const filePath = path.join(directory, file);
            const stats = await fs.stat(filePath);

            if (stats.mtime < cutoffDate) {
                await fs.unlink(filePath);
            }
        }));
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
            throw error;
        }
    }
};

const cleanupService = {
    cleanup
};

export default cleanupService; 