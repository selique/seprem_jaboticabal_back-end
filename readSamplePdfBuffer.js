const fs = require('fs');
const path = require('path');

function readSamplePdfBuffer() {
  const filePath = path.join(__dirname, 'sample.pdf'); // Path to your sample PDF file
  return fs.readFileSync(filePath);
}

module.exports = readSamplePdfBuffer;