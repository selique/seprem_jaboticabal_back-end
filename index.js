import fs from 'fs';
import PDFParser from 'pdf2json';
import Tesseract from 'tesseract.js';

const pdfParser = new PDFParser();

pdfParser.on('pdfParser_dataError', errData => console.error(errData.parserError));
pdfParser.on('pdfParser_dataReady', pdfData => {
  // Convert PDF data to image buffer using Tesseract.js
  Tesseract.recognize(Buffer.from(pdfData.renderedPages[0].imageData, 'base64'))
    .then(result => {
      // Extract the desired fields from the OCR text
      const ocrText = result.text;
      const nomeRegex = /Nome:\s*(.*)\s*Matrícula:/;
      const nomeMatch = nomeRegex.exec(ocrText);
      const nome = nomeMatch ? nomeMatch[1] : null;
      
      // Write the extracted fields to a JSON file
      const output = { nome };
      fs.writeFile('./HOLERITE 12.2022.json', JSON.stringify(output), err => {
        if (err) throw err;
        console.log('File was saved.');
      });
    })
    .catch(err => {
      console.error('Error during OCR:', err);
    });
});

pdfParser.loadPDF('./HOLERITE 12.2022.pdf');