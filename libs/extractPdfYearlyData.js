const pdf = require('pdf-extraction');

const extractCpf = (item) => {
  const extract = item.match(/\d{3}.\d{3}.\d{3}-\d{2}/);
  return extract ? extract[0] : null;
};

const extractName = (item) => {
  const extract = item.match(/(?<=CPFNome Completo\d{3}.\d{3}.\d{3}-\d{2}).*?(?=Natureza do Rendimento)/);
  
  return extract
    ? extract[0].trim().toUpperCase().replace(/\s+/g, "-") 
    : null;
};

const extractYearCurrent = (item) => {
  const extract = item.match(/Exercício de \d+/);
  return extract ? +extract[0].replace(/[^\d]+/, '') : null;
};

const extractYearCalendar = (item) => {
  const extract = item.match(/calendário de \d+/);
  return extract ? +extract[0].replace(/[^\d]+/, '') : null;
};

const extractBusinessName = (item) => {
  const extract = item.match(/(?<=CNPJNome Empresarial\s+)\b[A-Z\s]+\b/);
  return extract ? extract[0].trim().toUpperCase() : null;
};


const extractPdfYearlyData = async (pdfBuffer) => {
  const data = await pdf(pdfBuffer);

  const page = data.text.replace(/\n/g, '');
  const extractedData = [];

  extractedData.push({
    cpf: extractCpf(page),
    name: extractName(page),
    year_current: extractYearCalendar(page),
    year_calendar: extractYearCurrent(page)
  });
  
  return extractedData;
};

module.exports = extractPdfYearlyData;
