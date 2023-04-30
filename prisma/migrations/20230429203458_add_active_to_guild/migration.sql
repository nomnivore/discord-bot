-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Guild" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "guild_id" TEXT NOT NULL,
    "guild_name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "prefix" TEXT NOT NULL DEFAULT '!'
);
INSERT INTO "new_Guild" ("createdAt", "guild_id", "guild_name", "id", "prefix", "updatedAt") SELECT "createdAt", "guild_id", "guild_name", "id", "prefix", "updatedAt" FROM "Guild";
DROP TABLE "Guild";
ALTER TABLE "new_Guild" RENAME TO "Guild";
CREATE UNIQUE INDEX "Guild_guild_id_key" ON "Guild"("guild_id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
