import fs from 'fs';
import path from 'path';

export const FOLDERS = {
    INPUT: 'input_files',
    OUTPUT: 'output_files'
} as const;

const getBasePath = (): string => {
    const basePath = process.env.LSF_CLUSTER_BASE_PATH;
    if (!basePath) {
        throw new Error('LSF_CLUSTER_BASE_PATH environment variable is not set');
    }
    return basePath;
};

const getFileDirectories = (): { inputDir: string; outputDir: string } => {
    const basePath = getBasePath();
    const inputDir = path.join(basePath, FOLDERS.INPUT);
    const outputDir = path.join(basePath, FOLDERS.OUTPUT);

    [inputDir, outputDir].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });

    return { inputDir, outputDir };
};

export default {
    getFileDirectories,
    getBasePath
};
