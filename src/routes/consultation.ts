import Handlebars from 'handlebars';
import { Request, Response } from 'express';
import { app } from './app';
import fs from 'fs';
import axios from 'axios';
import { ready, stores } from '../store';
import { Http } from '@status/codes';
import { ExamOrder } from '../types';
import { getImageryExamOrders, getImageryExamsTypes } from './imagery';
import { getLaboratoryExamSettings } from './lab/utils.';

const getPrescriptions = async (consultationId: string) => {
  // TODO define the exact type
  const prescriptions: any[] = [];
  const cursor = stores.prescriptions.find({
    consultationId,
  });

  await cursor.forEach((prescription: any) => {
    prescriptions.push(prescription);
  });

  return prescriptions;
};

const getLaboratoryExams = async (consultationId: string) => {
  const orders: ExamOrder[] = [];
  const cursor = stores.laboratoryExamOrders.find({
    consultationId,
  });

  await cursor.forEach((order: ExamOrder) => {
    orders.push(order);
  });

  return orders;
};

const readConsultationTemplateFile = () => {
  return new Promise(
    (
      resolve: (value: HandlebarsTemplateDelegate<any>) => void,
      reject: (err: any) => void
    ) => {
      fs.readFile(
        'src/views/consultation.hbs',
        (error: NodeJS.ErrnoException | null, data: Buffer) => {
          if (error) {
            reject(error);
            return;
          } else {
            const template = Handlebars.compile(data.toString());
            resolve(template);
          }
        }
      );
    }
  );
};

const getConsultation = async (consultationId: string) => {
  const { data } = await axios.get(
    `http://localhost:8086/consultations/${consultationId}`
  );

  return data;
};

const getContextData = (consultationId: string) => {
  const consultation = getConsultation(consultationId);
  const prescriptions = getPrescriptions(consultationId);
  const labExamOrders = getLaboratoryExams(consultationId);
  const examsConfig = getLaboratoryExamSettings();
  const imageryConfig = getImageryExamsTypes();
  const imageryExamOrders = getImageryExamOrders(consultationId);

  return Promise.all([
    consultation,
    prescriptions,
    examsConfig,
    labExamOrders,
    imageryConfig,
    imageryExamOrders,
  ]);
};

ready.then((isAppReady) => {
  if (!isAppReady) {
    return;
  }

  app.get('/:scope/consultations/:id', async (req: Request, res: Response) => {
    try {
      const template = await readConsultationTemplateFile();
      const context = await getContextData(req.params.id);

      res.send(
        template({
          consultation: context[0],
          prescriptions: context[1],
          examsConfig: context[2],
          labExamOrders: context[3],
          imageryConfig: context[4],
          imageryExamOrders: context[5],
          consultationNotes: context[0].notes.split('\n'),
          scope: req.params.scope,
        })
      );
    } catch (e: any) {
      console.error(e);
      res.status(Http.InternalServerError).send(e);
    }
  });

  app.put('/consultations/:id', async (req: Request, res: Response) => {
    const { body } = req;

    try {
      await axios.put(`http://localhost:8086/consultations/${req.params.id}`, {
        notes: body.notes.join?.('\n'),
      });
      res.redirect(`/consultations/${req.params.id}`);
    } catch (e) {
      console.error(e);
    }
  });

  app.put(
    '/consultations/:id/move_to_in_progress',
    async (req: Request, res: Response) => {
      const { body } = req;

      try {
        await axios.put(
          `http://localhost:8086/consultations/${req.params.id}`,
          {
            ...body,
            status: 'EN_COURS',
          }
        );
        res.redirect(`/box/consultations/${req.params.id}`);
      } catch (e) {
        console.error(e);
      }
    }
  );

  app.delete('/consultations/:id', (req: Request, res: Response) => {
    axios.delete(`http://localhost:8086/consultations/${req.params.id}`);
    res.redirect('/consultations');
  });
});
