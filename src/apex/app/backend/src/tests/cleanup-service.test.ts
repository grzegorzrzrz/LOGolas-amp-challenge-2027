import cleanupService from '../services/cleanup-service.js';
import fs from 'fs/promises';
import path from 'path';
import { testInputFolder, testOutputFolder } from './test-utils.js';

describe('Cleanup Service', () => {
    beforeEach(async () => {
        await fs.mkdir(testInputFolder, { recursive: true });
        await fs.mkdir(testOutputFolder, { recursive: true });
    });

    afterEach(async () => {
        await fs.rm(testInputFolder, { recursive: true, force: true }).catch(console.warn);
        await fs.rm(testOutputFolder, { recursive: true, force: true }).catch(console.warn);
    });

    describe('cleanup', () => {
        it('should remove files older than retention period', async () => {
            // Create test files with old dates
            const oldDate = new Date();
            oldDate.setDate(oldDate.getDate() - 8); // 8 days old

            const oldInputFile = path.join(testInputFolder, 'old-input.txt');
            const oldOutputFile = path.join(testOutputFolder, 'old-output.txt');
            
            await fs.writeFile(oldInputFile, 'old test data');
            await fs.writeFile(oldOutputFile, 'old test output');
            await fs.utimes(oldInputFile, oldDate, oldDate);
            await fs.utimes(oldOutputFile, oldDate, oldDate);

            // Create recent files
            const newInputFile = path.join(testInputFolder, 'new-input.txt');
            const newOutputFile = path.join(testOutputFolder, 'new-output.txt');
            
            await fs.writeFile(newInputFile, 'new test data');
            await fs.writeFile(newOutputFile, 'new test output');

            // Run cleanup
            await cleanupService.cleanup();

            // Check old files are removed
            await expect(fs.access(oldInputFile)).rejects.toThrow();
            await expect(fs.access(oldOutputFile)).rejects.toThrow();

            // Check new files still exist
            await expect(fs.access(newInputFile)).resolves.toBeUndefined();
            await expect(fs.access(newOutputFile)).resolves.toBeUndefined();
        });

        it('should not remove files within retention period', async () => {
            const recentFile = path.join(testInputFolder, 'recent.txt');
            await fs.writeFile(recentFile, 'recent test data');

            await cleanupService.cleanup();

            await expect(fs.access(recentFile)).resolves.toBeUndefined();
        });
    });
}); 