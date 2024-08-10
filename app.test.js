const request = require('supertest');
const app = require('./index');
const validateFilenamePattern = require('./libs/validationFileName')
jest.setTimeout(30000); // Increase timeout

describe('Utils libs', () => {

  it('validateFilenamePattern ', () => { 
    expect(validateFilenamePattern('035.169.068-98-ADELAIDE-DA-SILVA-DEL-VECHIO-25519-1-2020.pdf')).toBe(true);
    
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
