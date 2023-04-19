const express = require("express");
const extractPdfData = require("./libs/extractPdfData");
const extractPdfYearlyData = require("./libs/extractPdfYearlyData");
const multer = require("multer");
const { PDFDocument } = require("pdf-lib");
const cors = require("cors");

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
      return res
        .status(400)
        .send("Invalid file type. Only PDF files are allowed.");
    }

    res.set("Content-Type", "application/pdf");

    const pdfData = req.file && req.file.buffer;

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
            if (cpf && name && enrollment) {
              const pageFileName = `${cpf}-${name}-${enrollment}-${month}-${year}.pdf`;

              const nameWithoutDash = name.replace(/-/g, " ");
              const pdfObject = {
                name: nameWithoutDash,
                cpf,
                enrollment,
                year,
                month,
                pdf: {
                  fileName: pageFileName,
                  file: Buffer.from(pageBuffer).toString("base64"),
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
          const extractedData = await extractPdfYearlyData(pageBuffer);

          if (extractedData[0]) {
            const { cpf, name, year_current, year_calendar } = extractedData[0];
            if (cpf && name && year_current && year_calendar) {
              const pageFileName = `${cpf}-${name}-${year_current}.pdf`;

              const nameWithoutDash = name.replace(/-/g, " ");
              const pdfObject = {
                cpf,
                name: nameWithoutDash,
                year: year_current,
                pdf: {
                  fileName: pageFileName,
                  file: Buffer.from(pageBuffer).toString("base64"),
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

app.listen(process.env.PORT || 8080, () => {
  console.log(`Server started on port ${process.env.PORT || 8080}`);
});
