import { closeTestDb } from "./test-db";

export default async function globalTeardown() {
    await closeTestDb();
}