const argon2 = require('argon2');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createBeneficiary(input) {
  const { cpf, name, type_beneficiary, enrollment } = input;

  const exists = await prisma.beneficiaryUser.findFirst({
    where: { cpf },
  });

  if (exists) {
    throw new Error('User already exists.');
  }

  const hashedPassword = await argon2.hash(enrollment.toString());

  const result = await prisma.beneficiaryUser.create({
    data: {
      cpf,
      password: hashedPassword,
      name,
      type_beneficiary,
      enrollment,
    },
  });

  return {
    status: 201,
    message: 'Account created successfully',
    result: result.cpf,
  };
}

module.exports = { createBeneficiary };