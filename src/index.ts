import { app } from './routes/app';
import './routes';
import { client, ready, store } from './store';

const handlebars = require('handlebars');
const layouts = require('handlebars-layouts');

ready.then((appReady: boolean) => {
  if (!appReady) {
    return;
  }

  layouts.register(handlebars);

  const server = app.listen(8089, () => {
    console.log('Started listening');
  });

  server.on('close', () => {
    client.close();
  });
});
