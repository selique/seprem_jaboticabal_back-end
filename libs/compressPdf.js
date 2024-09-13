const { existsSync } = require('fs');
const fs = require('fs/promises');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execPromise = promisify(exec);

const compressPdf = async (base64) => {
    try {
        const cwd = process.cwd();
        const tempFolder = path.join(cwd, 'temp');
        const hasTempFolder = existsSync(tempFolder);

        if (!hasTempFolder) {
        await fs.mkdir(tempFolder);
        }

        const originalFilePath = path.join(tempFolder, 'original.pdf');
        const compressedFilePath = path.join(tempFolder, 'compressed.pdf');

        await fs.writeFile(originalFilePath, base64, 'base64');

        await execPromise(
        `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${compressedFilePath}" ${originalFilePath}`
        );

        const compressedFileBase64 = await fs.readFile(compressedFilePath, 'base64');

        await fs.unlink(originalFilePath);
        await fs.unlink(compressedFilePath);

        return compressedFileBase64;
    } catch (error) {
        throw new Error(`PDF Compression failed: ${error.message}`);
    }
};

module.exports = compressPdf;