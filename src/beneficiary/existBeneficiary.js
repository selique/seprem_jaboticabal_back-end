const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function existBeneficiary(pdfObject) {
  try {
    const beneficiaryExists = await prisma.beneficiary.findFirst({
      where: { cpf: pdfObject.cpf },
    });

    return beneficiaryExists;
  } catch (error) {
    console.error(`Error checking if beneficiary exists: ${error}`);
    throw error;
  }
}

module.exports = { existBeneficiary };