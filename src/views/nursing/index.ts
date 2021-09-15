import fs from 'fs';
import Handlebars from 'handlebars';

export const nursingTab = Handlebars.compile(
  fs.readFileSync('src/views/nursing/nursing-tab.hbs').toString()
);
