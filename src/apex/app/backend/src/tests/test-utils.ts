import path from 'path';

const testFilesFolder = path.join(process.cwd(), 'src', 'tests', 'test-files');
const testInputFolder = path.join(testFilesFolder, 'input');
const testOutputFolder = path.join(testFilesFolder, 'output');

export {
    testFilesFolder,
    testInputFolder,
    testOutputFolder
}; 