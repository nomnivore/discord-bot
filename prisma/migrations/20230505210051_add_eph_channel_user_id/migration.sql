/*
  Warnings:

  - Added the required column `ownerId` to the `EphemeralVoiceChannel` table without a default value. This is not possible if the table is not empty.

*/
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
    CONSTRAINT "EphemeralVoiceChannel_voiceChannelGeneratorId_fkey" FOREIGN KEY ("voiceChannelGeneratorId") REFERENCES "VoiceChannelGenerator" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_EphemeralVoiceChannel" ("channelId", "createdAt", "guildId", "id", "updatedAt", "voiceChannelGeneratorId") SELECT "channelId", "createdAt", "guildId", "id", "updatedAt", "voiceChannelGeneratorId" FROM "EphemeralVoiceChannel";
DROP TABLE "EphemeralVoiceChannel";
ALTER TABLE "new_EphemeralVoiceChannel" RENAME TO "EphemeralVoiceChannel";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
