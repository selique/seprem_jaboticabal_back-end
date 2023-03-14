const pdf = require('pdf-extraction');

const extractCpf = (item) => {
  const extract = item.match(/\d{3}.\d{3}.\d{3}-\d{2}/);
  return extract ? extract[0] : null;
};

const extractName = (item) => {
  const extract = item.match(/Nome Completo.*RendimentoAposentadoria/);
  return extract
    ? extract[0]
        .replace(/Nome Completo\d{3}.\d{3}.\d{3}-\d{2}/, '')
        .replace(/Natureza do RendimentoAposentadoria/, '')
        .toUpperCase()
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

const extractPdfYearlyData = async (pdfBuffer) => {
  const data = await pdf(pdfBuffer);

  const page = data.text.replace(/\n/g, '');
  const extractedData = [];

  extractedData.push({
    cpf: extractCpf(page),
    name: extractName(page),
    year_current: extractYearCurrent(page),
    year_calendar: extractYearCalendar(page),
  });

  return extractedData;
};

module.exports = extractPdfYearlyData;
