import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

type SequenceService = {
    saveAsFasta: (sequence: string, filename: string, inputDir: string) => Promise<string>;
};

const submitSequence = async (sequence: string, name?: string): Promise<string> => {
    const cleaned = cleanSequence(sequence);
    
    if (!validateProteinSequence(cleaned)) {
        throw new Error('Invalid DNA sequence. Sequence must only contain A, T, G, C, and N.');
    }
    return "";
}

const saveAsFasta = async (sequence: string, filename: string, inputDir: string): Promise<string> => {
    // const cleaned = cleanSequence(sequence);
    const cleaned = sequence;
    
    // if (!validateProteinSequence(cleaned)) {
    //     throw new Error('Invalid DNA sequence. Sequence must only contain A, T, G, C, and N.');
    // }

    const uploadsDir = inputDir;
    await fs.mkdir(uploadsDir, { recursive: true });
    
    const randomId = crypto.randomUUID();
    const filePath = path.join(uploadsDir, filename);
    const formattedSequence = formatSequence(cleaned); 
    const fastaContent = formattedSequence;

    await fs.writeFile(filePath, fastaContent, 'utf-8');
    return filePath;
};

// Helper functions ----

const cleanSequence = (sequence: string): string =>
    sequence.replace(/\s+/g, '').toUpperCase();

const formatSequence = (sequence: string): string => {
    const lineLength = 60;
    return sequence
        .match(new RegExp(`.{1,${lineLength}}`, 'g'))
        ?.join('\n') ?? '';
};

const validateProteinSequence = (sequence: string): boolean => {
    const cleaned = cleanSequence(sequence);
    return /^[ACDEFGHIKLMNPQRSTVWY]+$/.test(cleaned);
};

const createUploadDirectory = async (): Promise<string> => {
    const basePath = process.env.LSF_CLUSTER_BASE_PATH;
    if (!basePath) {
        throw new Error('LSF_CLUSTER_BASE_PATH environment variable is not set');
    }
    return path.join(basePath, 'input');
}; 

const sequenceService: SequenceService = {
    saveAsFasta
};

export default sequenceService;