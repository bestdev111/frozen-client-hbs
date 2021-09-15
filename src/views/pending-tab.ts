import fs from 'fs';
import Handlebars from 'handlebars';

export const pendingTab = Handlebars.compile(
  fs.readFileSync('src/views/pending-tab.hbs').toString()
);
