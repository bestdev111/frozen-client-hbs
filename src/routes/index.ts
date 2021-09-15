import { Request, Response } from 'express';
import Handlebars from 'handlebars';
import fs from 'fs';
import { registerPartials } from '../views';
import { app } from './app';
import { Http } from '@status/codes';
import { ready } from '../store';

import './consultations';
import './consultation';
import './prescriptions';
import './laboratory';

require('dotenv').config();

ready.then((isAppReady: boolean) => {
  if (!isAppReady) {
    return;
  }

  registerPartials();

  app.get('/', (req: Request, res: Response) => {
    fs.readFile('src/views/index.hbs', { encoding: 'utf-8' }, (error, data) => {
      if (error) {
        console.error(error);
        res.status(Http.InternalServerError).send(error);
        return;
      }

      const template = Handlebars.compile(data);
      res.send(template({}));
    });
  });
});
