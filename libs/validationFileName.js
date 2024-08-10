const validateFilenamePattern = (filename) => {
    // Remove símbolos do meio do nome (permitindo apenas letras, números, e hifens)
    const sanitizedFilename = filename.replace(/[^A-Z0-9\-\.]/gi, '');

    // Padrão atualizado para corresponder ao novo formato
    const pattern = /^\d{3}\.\d{3}\.\d{3}-\d{2}-[A-Z\-]+-\d+-\d{1,2}-\d{4}\.pdf$/;

    if (!pattern.test(sanitizedFilename)) {
        console.log(`Invalid filename pattern. Skipping... ${filename}`);
        return false;
    }

    return true;
};

module.exports = validateFilenamePattern;