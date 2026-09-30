import { createTestDb } from "./test-db";

export default async function globalSetup() {
    await createTestDb();
    
}