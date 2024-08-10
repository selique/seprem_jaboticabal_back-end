const request = require('supertest');
const app = require('./index');
const validateFilenamePattern = require('./libs/validationFileName')
jest.setTimeout(30000); // Increase timeout


const sanitizeFilename = (name) => {
  // Remove qualquer caractere que não seja uma letra, número ou hifen
  return name.replace(/[^A-Z0-9\-]/gi, '');
};

const isValidFilename = (name) => {
  const sanitizedFilename = sanitizeFilename(name);

  // Expressão regular para validar o padrão esperado: CPF-nome-código-numero-ano
  const filenamePattern = /^\d{3}\d{3}\d{3}\d{2}[A-Z\-]+-\d+-\d{4}$/i;

  return filenamePattern.test(sanitizedFilename);
};

module.exports = { sanitizeFilename, isValidFilename };

describe('Utils libs', () => {

  it('validateFilenamePattern', () => {
    // Teste para um nome de arquivo válido
    expect(validateFilenamePattern('035.169.068-98-ADELAIDE-DA-SILVA-DEL-VECHIO-25519-1-2020.pdf')).toBe(true);
    expect(validateFilenamePattern('03516906898-ADELAIDE-DA-SILVA-DEL-VECHIO-25519-1-2020.pdf')).toBe(true);

    // Teste para um nome de arquivo inválido
    expect(validateFilenamePattern('invalid-filename.pdf')).toBe(false);
  });

});

describe('PDF Processing API', () => {

  describe('POST /holerites', () => {
    it('should process a valid PDF file', async () => {
      try {
        const res = await request(app)
          .post('/holerites')
          .attach('pdf', 'sample-holerite.pdf') // Ensure this file exists
          .query({ numberPages: 1 });

        // console.log('Response:', res.body); // Log the response for debugging

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(expect.arrayContaining([{
          name: 'ADELAIDE DA SILVA DEL VECHIO',
          cpf: '035.169.068-98',
          enrollment: 25519,
          month: 1,
          year: 2020,
          pdf: {
            fileName: '035.169.068-98-ADELAIDE-DA-SILVA-DEL-VECHIO-25519-1-2020.pdf',
            file: expect.any(String),
          },
        }]));
      } catch (error) {
        console.error('Test failed with error:', error);
        throw error;
      }
    });
  });

  describe('POST /declaracao-anual', () => {
    it('should process a valid PDF file', async () => {
      try {
        const res = await request(app)
          .post('/declaracao-anual')
          .attach('pdf', 'sample-declaracao-anual.pdf') // Ensure this file exists
          .query({ numberPages: 1 });

        // console.log('Response:', res.body); // Log the response for debugging

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(expect.arrayContaining([{
          cpf: '035.169.068-98',
          name: 'ADELAIDE DA SILVA DEL VECHIO',
          year: 2021,
          pdf: {
            fileName: '035.169.068-98-ADELAIDE-DA-SILVA-DEL-VECHIO-2021.pdf',
            file: expect.any(String),
          },
        }]));
      } catch (error) {
        console.error('Test failed with error:', error);
        throw error;
      }
    });
  });
});
