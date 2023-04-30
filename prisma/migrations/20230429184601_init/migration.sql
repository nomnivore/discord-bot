-- CreateTable
CREATE TABLE "Guild" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "guild_id" TEXT NOT NULL,
    "guild_name" TEXT NOT NULL,
    "prefix" TEXT NOT NULL DEFAULT '!'
);

-- CreateIndex
CREATE UNIQUE INDEX "Guild_guild_id_key" ON "Guild"("guild_id");
