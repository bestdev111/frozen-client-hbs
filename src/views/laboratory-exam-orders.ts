import fs from 'fs';
import Handlebars from 'handlebars';

export const laboratoryExamOrders = Handlebars.compile(
  fs.readFileSync('src/views/laboratory-exam-orders.hbs').toString()
);
