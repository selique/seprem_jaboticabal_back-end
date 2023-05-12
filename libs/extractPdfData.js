const pdf = require("pdf-extraction");

const extractCpf = (item) => {
  const regex = /CPF[\n\s]*(\d{3}\.\d{3}\.\d{3}\-\d{2})/;
  const match = item.match(regex)?.[1];
  if (match) {
    return match ?? null;
  } else {
    const regex = /\d{3}\.\d{3}\.\d{3}\-\d{2}/;
    const match = item.match(regex);
    const cpf = match ? match[0] : null;
    return cpf?.replace(/[.-]/g, "") ?? null;
  }
};

const extractYear = (item) => {
  const regex = /(?:\bde\s+)(\d{4})/
  const match = item.match(regex)
  return match ? +match[1] : null
}

const extractName = (item) => {
  const regex =
    /\d{5}[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ0-9'.\s]+MatrículaNome/;
  const match = item.match(regex);

  if (match) {
    const name = match[0]
      .replace(/^\d{5}/, "")
      .replace(/MatrículaNome/, "")
      .trim();

    return name.replace(/\s+/g, "-");
  } else {
    const regex1 = /Nome\s+(.+)\s+\d{3}\.\d{3}\.\d{3}\-\d{2}/;
    const match1 = item.match(regex1);
    const name1 = match1 ? match1[1] : "";

    const regex2 = /Nome\s+(.+)\s+\d{2}\/\d{2}\/\d{4}/;
    const match2 = item.match(regex2);
    const name2 = match2 ? match2[1] : "";

    return name1.replace(/\s+/g, "-") || name2.replace(/\s+/g, "-") || null;
  }
};

const extractEnrollment = (item) => {
  const regex =
    /(\d{5})[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ0-9'.\s]+MatrículaNome/;
  const match = item.match(regex);

  if (match) {
    return +match[1];
  } else {
    const regex = /Matrícula\s+(\d{5})/;
    const match = item.match(regex);
    return match ? +match[1] : null;
  }
};

const extractMonth = (item) => {
  const months = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];
  const regex = /Mensal([A-Za-z]+) de (\d{4})|(\w+)\s+de\s+(\d{4})Mensal|Mensal([A-Za-zç]+)(?:\s+de\s+)?(\d{4})|(?:\d{2}\/\d{2}\/\d{4}Mensal)?([A-Za-zç]+)\s+de\s+(\d{4})/i;
  const match = item.match(regex);
  if (!match) return null;
  let monthName = null;
  for (let i = 1; i < match.length; i++) {
    const elem = match[i];
    if (elem && /^[A-Za-zç]+$/.test(elem)) {
      monthName = elem;
      break;
    }
  }
  const monthIndex = monthName ? months.findIndex(
    (m) => m.toLowerCase() === monthName.toLowerCase()
  ) : -1;
  return monthIndex !== -1 ? monthIndex + 1 : null;
};

const extract13 = (item) => {
  const regex = /13º\s+Salário\s+Integral/;
  const match = item.match(regex);
  return match ? 13 : null;
};



const extractPdfData = async (pdfBuffer) => {
  const data = await pdf(pdfBuffer);
  
  const page = data.text;
  const extractedData = [];
 
  extractedData.push({
    cpf: extractCpf(page),
    name: extractName(page),
    enrollment: extractEnrollment(page),
    month: extractMonth(page) !== null ? extractMonth(page) : extract13(page),
    year: extractYear(page),
  });
  
  return extractedData;
};

module.exports = extractPdfData;
