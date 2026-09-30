import { PrismaClient } from '@prisma/client';

let prismaInstance: PrismaClient | null = null;

const getInstance = (): PrismaClient => {
    if (!prismaInstance) {
        prismaInstance = new PrismaClient();
    }
    return prismaInstance;
};

const resetInstance = (instance: PrismaClient | null = null): void => {
    prismaInstance = instance;
};

const db = { getInstance, resetInstance };

export default db;