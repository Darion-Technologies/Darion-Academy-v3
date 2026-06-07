CREATE TYPE "AppearanceTheme" AS ENUM ('SYSTEM', 'LIGHT', 'DARK');

ALTER TABLE "LearningPreference"
  ADD COLUMN "theme" "AppearanceTheme" NOT NULL DEFAULT 'SYSTEM',
  ADD COLUMN "sidebarCollapsed" BOOLEAN NOT NULL DEFAULT false;
