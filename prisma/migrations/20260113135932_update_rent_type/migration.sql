/*
  Warnings:

  - You are about to alter the column `rentPerDay` on the `Booking` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "rentPerDay" SET DATA TYPE INTEGER,
ALTER COLUMN "status" SET DEFAULT 'BOOKED';
