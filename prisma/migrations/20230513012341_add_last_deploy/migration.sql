-- CreateTable
CREATE TABLE "LastDeploy" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "guildId" TEXT NOT NULL,
    "hash" TEXT NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EphemeralVoiceChannel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "guildId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "voiceChannelGeneratorId" INTEGER,
    CONSTRAINT "EphemeralVoiceChannel_voiceChannelGeneratorId_fkey" FOREIGN KEY ("voiceChannelGeneratorId") REFERENCES "VoiceChannelGenerator" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_EphemeralVoiceChannel" ("channelId", "createdAt", "guildId", "id", "ownerId", "updatedAt", "voiceChannelGeneratorId") SELECT "channelId", "createdAt", "guildId", "id", "ownerId", "updatedAt", "voiceChannelGeneratorId" FROM "EphemeralVoiceChannel";
DROP TABLE "EphemeralVoiceChannel";
ALTER TABLE "new_EphemeralVoiceChannel" RENAME TO "EphemeralVoiceChannel";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
