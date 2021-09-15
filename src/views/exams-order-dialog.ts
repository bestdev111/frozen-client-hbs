import fs from 'fs';
import Handlebars from 'handlebars';

export const examsOrderDialog = Handlebars.compile(
  fs.readFileSync('src/views/exams-order-dialog.hbs').toString()
);
