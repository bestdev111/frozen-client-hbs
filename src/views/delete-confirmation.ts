import fs from 'fs';
import Handlebars from 'handlebars';

export const deleteConfirmation = Handlebars.compile(
  fs.readFileSync('src/views/delete-confirmation.hbs').toString()
);
