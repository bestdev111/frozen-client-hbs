import fs from 'fs';
import Handlebars from 'handlebars';

export const paginationScripts = Handlebars.compile(
  fs.readFileSync('src/views/pagination-scripts.hbs').toString()
);
