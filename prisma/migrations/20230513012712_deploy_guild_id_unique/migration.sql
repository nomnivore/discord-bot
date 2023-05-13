/*
  Warnings:

  - A unique constraint covering the columns `[guildId]` on the table `LastDeploy` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "LastDeploy_guildId_key" ON "LastDeploy"("guildId");
