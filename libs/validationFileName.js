const validateFilenamePattern = (filename) => {
    const pattern = /^\d{3}\.\d{3}\.\d{3}-\d{2}-[A-Z\-]+-\d+-\d{1,2}-\d{4}\.pdf$/;
    return pattern.test(filename);
};
module.exports = validateFilenamePattern