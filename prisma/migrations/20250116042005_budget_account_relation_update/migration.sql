/*
  Warnings:

  - A unique constraint covering the columns `[accountId]` on the table `budgets` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "budgets_accountId_key" ON "budgets"("accountId");
