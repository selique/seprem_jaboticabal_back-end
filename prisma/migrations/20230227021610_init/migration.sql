-- CreateTable
CREATE TABLE "BeneficiaryUser" (
    "id" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type_beneficiary" TEXT NOT NULL,
    "enrollment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BeneficiaryUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BeneficiaryUser_cpf_key" ON "BeneficiaryUser"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "BeneficiaryUser_enrollment_key" ON "BeneficiaryUser"("enrollment");
