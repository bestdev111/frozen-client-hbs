import express, { json, urlencoded } from 'express';
import cors from 'cors';
import methodOverride from 'method-override';
import { ready } from '../store';
import { pagination } from '../middlewares';

export const app = express();

ready.then((isAppReady: boolean) => {
  if (!isAppReady) {
    console.error('App is not ready, cannot proceed.');
    return;
  }

  app.use(cors());
  app.use(json());
  app.use(urlencoded({ extended: true }));
  app.use(express.static('public'));
  app.use(methodOverride('_method'));
  app.use(methodOverride('X-Method-Override'));
  app.use(methodOverride('X-HTTP-Method'));
  app.use(methodOverride('X-HTTP-Method-Override'));
  app.use(methodOverride('X-HTTP-Method-Override'));
  app.use(pagination());
});
