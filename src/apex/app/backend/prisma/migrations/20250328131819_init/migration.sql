-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inputFilePath" TEXT NOT NULL,
    "outputFilePath" TEXT,
    "status" TEXT NOT NULL,
    "lsfJobId" TEXT,
    "errorMessage" TEXT,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
