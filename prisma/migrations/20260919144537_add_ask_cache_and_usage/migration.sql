-- CreateTable
CREATE TABLE "AskAnswer" (
    "organizationId" TEXT NOT NULL,
    "questionHash" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AskAnswer_pkey" PRIMARY KEY ("organizationId","questionHash")
);

-- CreateTable
CREATE TABLE "AskUsage" (
    "userId" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AskUsage_pkey" PRIMARY KEY ("userId","windowStart")
);

-- AddForeignKey
ALTER TABLE "AskAnswer" ADD CONSTRAINT "AskAnswer_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AskUsage" ADD CONSTRAINT "AskUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
