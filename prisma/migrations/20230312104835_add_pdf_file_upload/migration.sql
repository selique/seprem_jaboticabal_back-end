/*
  Warnings:

  - Added the required column `enrollment` to the `BeneficiaryUser` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PdfFileType" AS ENUM ('HOLERITE', 'DESMOTRATIVO_ANUAL');

-- DropIndex
DROP INDEX "BeneficiaryUser_enrollment_key";

-- AlterTable
ALTER TABLE "BeneficiaryUser" DROP COLUMN "enrollment",
ADD COLUMN     "enrollment" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "BeneficiaryPdfFile" (
    "id" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" "PdfFileType" NOT NULL,
    "file" BYTEA[],
    "year" INTEGER,
    "month" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BeneficiaryPdfFile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BeneficiaryPdfFile" ADD CONSTRAINT "BeneficiaryPdfFile_cpf_fkey" FOREIGN KEY ("cpf") REFERENCES "BeneficiaryUser"("cpf") ON DELETE RESTRICT ON UPDATE CASCADE;
