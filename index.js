const express = require("express");
const extractPdfData = require('./libs/extractPdfData');
const extractPdfYearlyData = require("./libs/extractPdfYearlyData");
const validateFilenamePattern = require('./libs/validationFileName')
const multer = require("multer");
const { PDFDocument } = require("pdf-lib");
const cors = require("cors");
const compressPdf = require('./libs/compressPdf');

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      cb(new Error("Invalid file type. Only PDF files are allowed."));
    } else {
      cb(null, true);
    }
  },
}).single("pdf");

const app = express();

app.use(cors(
  {
    origin: "*",
    methods: "POST",
    preflightContinue: false,
    optionsSuccessStatus: 204
  }
));

app.post("/holerites", (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error(err);
      return res.status(400).send("Invalid file type. Only PDF files are allowed.");
    }

    res.set("Content-Type", "application/pdf");

    const pdfData = req.file && req.file.buffer;
    const pdfDoc = await PDFDocument.load(pdfData);
    const pageBuffers = [];

    try {
      const niPages = Number(req.query.numberPages);
      for (let i = 0; i < pdfDoc.getPages().length; i += niPages) {
        const newDocument = await PDFDocument.create();
        const niPagesArray = Array.from({ length: niPages }, (_, index) => (i + index));
        const copiedPages = await newDocument.copyPages(pdfDoc, niPagesArray);
        copiedPages.forEach((page, index) => {
          if (index === 0) {
            newDocument.addPage(page);
          } else {
            newDocument.insertPage(index, page);
          }
        });
        const pageBuffer = await newDocument.save();
        pageBuffers.push(pageBuffer);
      }

      const arrayResponseJson = [];

      for (const pageBuffer of pageBuffers) {
        try {
          const extractedData = await extractPdfData(pageBuffer);
          
          if (extractedData[0]) {
            const { cpf, year, month, name, enrollment } = extractedData[0];
            const sanitizedFilename = name.replace(/[^A-Z0-9\-]/gi, '');
            if (cpf && name && enrollment && validateFilenamePattern(`${cpf}-${sanitizedFilename.replace(/\s+/g, '-')}-${enrollment}-${month}-${year}.pdf`)) {
              const pageFileName = `${cpf}-${sanitizedFilename.replace(/\s+/g, '-')}-${enrollment}-${month}-${year}.pdf`;

              // Compress the PDF here
              const compressedPdfBase64 = await compressPdf(Buffer.from(pageBuffer).toString('base64'));

              const nameWithoutDash = name.replace(/-/g, " ");
              const pdfObject = {
                name: nameWithoutDash,
                cpf,
                enrollment,
                year,
                month,
                pdf: {
                  fileName: pageFileName,
                  file: compressedPdfBase64, // Store compressed PDF
                },
              };
              arrayResponseJson.push(pdfObject);
            } else {
              console.error("Invalid filename pattern. Skipping...", `${cpf}-${name.replace(/\s+/g, '-')}-${enrollment}-${month}-${year}.pdf`);
            }
          }
        } catch (error) {
          console.error(`Error processing PDF: ${error}`);
          return res.writeHead(500, { "Content-Type": "text/plain" }).end(`Error processing PDF: ${error}`);
        }
      }

      res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify(arrayResponseJson));
    } catch (error) {
      console.error(`Error processing PDF: ${error}`);
      res.writeHead(500, { "Content-Type": "text/plain" }).end("Error processing PDF");
    }
  });
});
app.post("/declaracao-anual", (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error(err);
      return res
        .status(400)
        .send("Invalid file type. Only PDF files are allowed.");
    }

    res.set("Content-Type", "application/pdf");

    const pdfData = req.file && req.file.buffer;
    const pdfDoc = await PDFDocument.load(pdfData);
    const pageBuffers = [];
    
    try {
      const niPages = Number(req.query.numberPages);
      for (let i = 0; i < pdfDoc.getPages().length; i += niPages) {
        const newDocument = await PDFDocument.create();
        const niPagesArray = Array.from({ length: niPages }, (_, index) => (i + index));
        const copiedPages = await newDocument.copyPages(pdfDoc, niPagesArray);
        copiedPages.map((page, index) =>  {
          if(index === 0) {
            newDocument.addPage(page);
          } else {
            newDocument.insertPage(index, page);
          }
        });
        const pageBuffer = await newDocument.save();
        pageBuffers.push(pageBuffer);
      }

      const arrayResponseJson = [];

      for (const pageBuffer of pageBuffers) {
        try {
          const extractedData = await extractPdfYearlyData(pageBuffer);
          
          if (extractedData[0]) {
            const { cpf, name, year_current } = extractedData[0];
            if (cpf && name && year_current) {
              const pageFileName = `${cpf}-${name}-${year_current}.pdf`;

              // Compress the PDF here
              const compressedPdfBase64 = await compressPdf(Buffer.from(pageBuffer).toString('base64'));

              const nameWithoutDash = name.replace(/-/g, " ");
              const pdfObject = {
                cpf,
                name: nameWithoutDash,
                year: year_current,
                pdf: {
                  fileName: pageFileName,
                  file: compressedPdfBase64 // Store compressed PDF,
                },
              };
              arrayResponseJson.push(pdfObject);
            } else {
              console.error("Invalid data extracted from PDF, Skipping...");
            }
          }
        } catch (error) {
          console.error(`Error processing PDF: ${error}`);
          return res
            .writeHead(500, { "Content-Type": "text/plain" })
            .end(`Error processing PDF: ${error}`);
        }
      }

      res
        .writeHead(200, { "Content-Type": "application/json" })
        .end(JSON.stringify(arrayResponseJson));
    } catch (error) {
      console.error(`Error processing PDF: ${error}`);
      res
        .writeHead(500, { "Content-Type": "text/plain" })
        .end("Error processing PDF");
    }
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(process.env.PORT || 8080, () => {
    console.log(`Server started on port ${process.env.PORT || 8080}`);
  });
}

module.exports = app;