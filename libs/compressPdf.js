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
            console.log(`Created temp directory at ${tempFolder}`);
        }

        const originalFilePath = path.join(tempFolder, 'original.pdf');
        const compressedFilePath = path.join(tempFolder, 'compressed.pdf');

        // Write the original PDF file
        await fs.writeFile(originalFilePath, base64, 'base64');
        console.log(`Original PDF written to ${originalFilePath}`);

        // Verify original file creation and log its size
        if (existsSync(originalFilePath)) {
            const originalFileStats = await fs.stat(originalFilePath);
            console.log(`Original file size: ${originalFileStats.size} bytes`);
        } else {
            throw new Error(`Original file not found at ${originalFilePath}`);
        }

        // Run Ghostscript to compress the PDF
        const { stdout, stderr } = await execPromise(
            `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${compressedFilePath}" "${originalFilePath}"`
        );

        if (stderr) {
            console.error(`Ghostscript error: ${stderr}`);
        }
        console.log(`Ghostscript output: ${stdout}`);

        // Verify compressed file creation and log its size
        if (existsSync(compressedFilePath)) {
            const compressedFileStats = await fs.stat(compressedFilePath);
            console.log(`Compressed file size: ${compressedFileStats.size} bytes`);
        } else {
            throw new Error(`Compressed file not found at ${compressedFilePath}`);
        }

        // Read the compressed file and convert it to base64
        const compressedFileBase64 = await fs.readFile(compressedFilePath, 'base64');

        // Clean up the temporary files
        await fs.unlink(originalFilePath);
        await fs.unlink(compressedFilePath);

        console.log('Successfully compressed and cleaned up files');

        return compressedFileBase64;
    } catch (error) {
        console.error(`PDF Compression failed: ${error.message}`);
        throw new Error(`PDF Compression failed: ${error.message}`);
    }
};

module.exports = compressPdf;
