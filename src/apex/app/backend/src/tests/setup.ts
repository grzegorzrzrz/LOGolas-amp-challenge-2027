import { resetTestDb } from './test-db';
import { jest } from '@jest/globals';

// Set longer timeout for tests to accommodate DB operations
jest.setTimeout(10000);

// Reset database between tests to start with a clean state
beforeEach(async () => {
  await resetTestDb();
});
