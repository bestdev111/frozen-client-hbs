import fs from 'fs';
import Handlebars from 'handlebars';

export const createConsultation = Handlebars.compile(
  fs.readFileSync('src/views/create-consultation.hbs').toString()
);
