/*
  Warnings:

  - You are about to drop the column `guild_id` on the `Guild` table. All the data in the column will be lost.
  - You are about to drop the column `guild_name` on the `Guild` table. All the data in the column will be lost.
  - Added the required column `guildId` to the `Guild` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guildName` to the `Guild` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Guild" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "guildId" TEXT NOT NULL,
    "guildName" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "prefix" TEXT NOT NULL DEFAULT '!'
);
INSERT INTO "new_Guild" ("active", "createdAt", "id", "prefix", "updatedAt") SELECT "active", "createdAt", "id", "prefix", "updatedAt" FROM "Guild";
DROP TABLE "Guild";
ALTER TABLE "new_Guild" RENAME TO "Guild";
CREATE UNIQUE INDEX "Guild_guildId_key" ON "Guild"("guildId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
