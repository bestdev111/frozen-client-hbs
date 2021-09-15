import fs from 'fs';
import Handlebars from 'handlebars';

export const prescriptionDialog = Handlebars.compile(
  fs.readFileSync('src/views/prescription-dialog.hbs').toString()
);
