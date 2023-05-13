-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_VoiceChannelGenerator" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "nameTemplate" TEXT NOT NULL DEFAULT '%user%''s Channel'
);
INSERT INTO "new_VoiceChannelGenerator" ("categoryId", "channelId", "createdAt", "guildId", "id", "updatedAt") SELECT "categoryId", "channelId", "createdAt", "guildId", "id", "updatedAt" FROM "VoiceChannelGenerator";
DROP TABLE "VoiceChannelGenerator";
ALTER TABLE "new_VoiceChannelGenerator" RENAME TO "VoiceChannelGenerator";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
