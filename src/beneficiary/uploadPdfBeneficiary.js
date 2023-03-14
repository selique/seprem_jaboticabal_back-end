const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function uploadPdfBeneficiary(input) {
  const { cpf, fileName, fileType, year, month, file } = input;

  // Verify that the user is authorized to perform this action
  // const isAdmin = await prisma.adminUser.findFirst({
  //   where: { email: (ctx.session as any)?.user?.email ?? '' },
  // });
  // if (!isAdmin) {
  //   throw new Error('You are not authorized to perform this action');
  // }

  // Convert the base64 string to a binary buffer
  const fileBuffer = Buffer.from(file, 'base64');

  // Create the PDF file in the database
  await prisma.beneficiaryPdfFile.create({
    data: {
      cpf,
      fileName,
      fileType,
      year,
      month,
      file: fileBuffer,
    },
  });

  return { success: true, error: null };
}

module.exports = { uploadPdfBeneficiary };