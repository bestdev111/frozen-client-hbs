import fs from 'fs';
import Handlebars from 'handlebars';

export const consultationTab = Handlebars.compile(
  fs.readFileSync('src/views/consultation-tab.hbs').toString()
);
