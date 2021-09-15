import fs from 'fs';
import Handlebars from 'handlebars';

export const sidenav = Handlebars.compile(
  fs.readFileSync('src/views/sidenav.hbs').toString()
);
