const express = require("express");
const multer = require("multer");
const { PDFDocument } = require("pdf-lib");
const extractPdfData = require("./libs/extractPdfData");
const cors = require("cors");
const { createBeneficiary } = require("./src/beneficiary/createBeneficiary");
const { uploadPdfBeneficiary } = require("./src/beneficiary/uploadPdfBeneficiary");
const { existBeneficiary } = require("./src/beneficiary/existBeneficiary");

const app = express();
app.use(cors()); // Add this line to enable CORS

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 * 10 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      cb(new Error("Invalid file type. Only PDF files are allowed."));
    } else {
      cb(null, true);
    }
  },
}).single("pdf");

app.post("/", (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error(`Error uploading file: ${err}`);
      return res.status(500).send("Error uploading file");
    }

    const pdfData = req.file?.buffer;
    if (!pdfData) {
      return res.status(400).send("No file uploaded");
    }

    const pdfDoc = await PDFDocument.load(pdfData);
    const pageBuffers = [];

    try {
      await Promise.all(
        pdfDoc.getPages().map(async (_, index) => {
          const newDocument = await PDFDocument.create();
          const [copiedPage] = await newDocument.copyPages(pdfDoc, [index]);
          newDocument.addPage(copiedPage);
          const pageBuffer = await newDocument.save();
          pageBuffers.push(pageBuffer);
        })
      );

      const arrayResponseJson = [];

      for (const pageBuffer of pageBuffers) {
        try {
          const extractedData = await extractPdfData(pageBuffer);
          if (extractedData[0]) {
            const { cpf, year, month, name, enrollment } = extractedData[0];
            if (!cpf || !name || !enrollment) {
              console.error("Invalid data extracted from PDF");
              return res.status(400).send("Invalid input");
            }

            const pageFileName = `${cpf}-${name}-${enrollment}-${month}-${year}.pdf`;

            if (!cpf) {
              console.error("CPF is null or undefined");
              return res.status(400).send("Invalid input");
            }

            const pdfObject = {
              cpf,
              name,
              enrollment,
              year,
              month,
              pdf: {
                fileName: pageFileName,
                file: Buffer.from(pageBuffer).toString("base64"),
              },
            };

            // verify if beneficiary exists in database
            const beneficiaryExists = await existBeneficiary(pdfObject);

            if (beneficiaryExists) {
              // upload pdf file into BeneficiaryPdfFile table
              const result = await uploadPdfBeneficiary(pdfObject);

              if (result.status !== 200) {
                return res.status(result.status).json(result);
              }
            } else {
              // create beneficiary
              const result = await createBeneficiary(pdfObject);
              if (result.status !== 200) {
                return res.status(result.status).json(result);
              }
            }

            arrayResponseJson.push(pdfObject);
          }
        } catch (error) {
          console.error(`Error processing PDF: ${error}`);
          return res.status(500).send(`Error processing PDF: ${error}`);
        }
      }

      return res.status(200).json(arrayResponseJson);
    } catch (error) {
      console.error(`Error processing PDF: ${error}`);
      return res.status(500).send("Error processing PDF");
    }
  });
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
