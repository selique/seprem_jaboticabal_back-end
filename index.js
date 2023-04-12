const express = require("express");
const extractPdfData = require("./libs/extractPdfData");
const extractPdfYearlyData = require("./libs/extractPdfYearlyData");
const multer = require("multer");
const { PDFDocument } = require("pdf-lib");
const cors = require('cors');
/* A library that extracts the text from a pdf. */
// const pdf = require('pdf-extraction');

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
});

const app = express();

// enable CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.post('/', upload.single("pdf"), async (req, res) => {
  const pdfData = req.file && req.file.buffer;
  if (!pdfData) {
    return res
      .writeHead(400, { "Content-Type": "text/plain" })
      .end("No file uploaded");
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
        if (req.query.fileType === "HOLERITE") {
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
                    /* Printing the extracted data and the text from the pdf. */
                // console.log(extractedData[0])
                // pdf(pageBuffer).then((data) => {
                //   console.log(data.text);
                // });
                console.error("Invalid data extracted from PDF, Skipping...");
              }
            }
          } catch (error) {
            console.error(`Error processing PDF: ${error}`);
            return res
              .writeHead(500, { "Content-Type": "text/plain" })
              .end(`Error processing PDF: ${error}`);
          }
        } else if (req.query.fileType === "DEMOSTRATIVO_ANUAL") {
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
              /* Printing the extracted data and the text from the pdf. */
                // console.log(extractedData[0])
                // pdf(pageBuffer).then((data) => {
                //   console.log(data.text);
                // });
                console.error("Invalid data extracted from PDF, Skipping...");
              }
            }
          } catch (error) {
            console.error(`Error processing PDF: ${error}`);
            return res
              .writeHead(500, { "Content-Type": "text/plain" })
              .end(`Error processing PDF: ${error}`);
          }
        } else {
          console.error("Invalid file type");
          return res
            .writeHead(400, { "Content-Type": "text/plain" })
            .end("Invalid file type");
        }
      }

      // return in json format the array of objects
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

app.listen(process.env.PORT ?? 3001, () => {
  console.log(`Server started on port ${process.env.PORT ?? 3001}`);
});