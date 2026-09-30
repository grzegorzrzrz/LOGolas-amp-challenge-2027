import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs/promises';
import { execSync } from 'child_process';
import db from "../data/db";
import { testFilesFolder } from "./test-utils";

let testDbPath: string | null = null;

const createTestDb = async (): Promise<{ dbPath: string; db: PrismaClient }> => {
    const currentInstance = db.getInstance();
    
    if (currentInstance) {
        await currentInstance.$disconnect();
    }
    
    db.resetInstance(null);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dbSnapshotDir = path.join(testFilesFolder, 'db-snapshots');
    await fs.mkdir(dbSnapshotDir, { recursive: true });
    testDbPath = path.join(dbSnapshotDir, `test-db-${timestamp}.db`);
    
    process.env.DATABASE_URL = `file:${testDbPath}`;
    
    const prismaInstance = new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL
            }
        }
    });
    
    db.resetInstance(prismaInstance);
    
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    return { dbPath: testDbPath, db: prismaInstance };
};

const resetTestDb = async (): Promise<void> => {
    const prismaInstance = db.getInstance();
    
    if (prismaInstance) {
        await prismaInstance.$executeRawUnsafe('PRAGMA foreign_keys = OFF;');
        
        const tables = await prismaInstance.$queryRaw<Array<{name: string}>>`
            SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%';
        `;
        
        tables.forEach(async ({ name }: { name: string }) => {
            await prismaInstance.$executeRawUnsafe(`DELETE FROM "${name}";`);
        });
        
        await prismaInstance.$executeRawUnsafe('PRAGMA foreign_keys = ON;');
    }
};

const closeTestDb = async (): Promise<void> => {
    const prismaInstance = db.getInstance();
    
    if (prismaInstance) {
        await prismaInstance.$disconnect();
        db.resetInstance(null);
    }
};

export { createTestDb, resetTestDb, closeTestDb };