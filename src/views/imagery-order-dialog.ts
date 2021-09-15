import fs from 'fs';
import Handlebars from 'handlebars';

export const imageryExamOrderDialog = Handlebars.compile(
  fs.readFileSync('src/views/imagery-order-dialog.hbs').toString()
);
