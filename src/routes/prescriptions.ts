import { Request, Response } from 'express';
import { ready, store, stores } from '../store';
import { app } from './app';
import { Http } from '@status/codes';

ready.then((isAppReady: boolean) => {
  if (!isAppReady) {
    return;
  }

  app.post('/prescriptions', (req: Request, res: Response) => {
    const prescription = req.body;

    stores.prescriptions.insertOne(prescription, (error: any, result) => {
      if (error) {
        res.json({ result: 'error', error }).status(Http.InternalServerError);
        return;
      }
      res.json({
        result: 'Ok',
        data: { id: result.insertedId, ...prescription },
      });
    });
  });
});
