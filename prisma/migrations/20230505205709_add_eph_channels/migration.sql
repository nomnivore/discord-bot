-- CreateTable
CREATE TABLE "EphemeralVoiceChannel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "voiceChannelGeneratorId" INTEGER,
    CONSTRAINT "EphemeralVoiceChannel_voiceChannelGeneratorId_fkey" FOREIGN KEY ("voiceChannelGeneratorId") REFERENCES "VoiceChannelGenerator" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
