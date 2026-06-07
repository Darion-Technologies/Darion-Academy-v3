CREATE TABLE "UserSession" (
  "id" TEXT NOT NULL,
  "userId" UUID NOT NULL,
  "sessionId" TEXT NOT NULL,
  "device" TEXT,
  "browser" TEXT,
  "operatingSystem" TEXT,
  "ipHash" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeenAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LearningPreference" (
  "id" TEXT NOT NULL,
  "userId" UUID NOT NULL,
  "resumeLastLesson" BOOLEAN NOT NULL DEFAULT true,
  "defaultLessonView" TEXT NOT NULL DEFAULT 'STANDARD',
  "courseReminders" BOOLEAN NOT NULL DEFAULT true,
  "reviewUpdates" BOOLEAN NOT NULL DEFAULT true,
  "certificateAlerts" BOOLEAN NOT NULL DEFAULT true,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LearningPreference_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserSession_sessionId_key" ON "UserSession"("sessionId");
CREATE INDEX "UserSession_userId_revokedAt_idx" ON "UserSession"("userId", "revokedAt");
CREATE UNIQUE INDEX "LearningPreference_userId_key" ON "LearningPreference"("userId");

ALTER TABLE "UserSession"
  ADD CONSTRAINT "UserSession_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LearningPreference"
  ADD CONSTRAINT "LearningPreference_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
