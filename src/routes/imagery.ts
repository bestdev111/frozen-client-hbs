import { Http } from '@status/codes';
import { Request, Response } from 'express';
import fs from 'fs';
import { MongoError } from 'mongodb';
import { ready, stores } from '../store';
import { ExamOrder, LaboratoryExamOrderStatus } from '../types';
import { app } from './app';
import { renderErrorPage } from './error';

export const getImageryExamsTypes = () => {
  return new Promise(
    (resolve: (value: any) => void, reject: (error: any) => void) => {
      fs.readFile(
        'assets/imagery.json',
        (err: NodeJS.ErrnoException | null, data: Buffer) => {
          if (err) {
            reject(err);
          } else {
            const json = JSON.parse(data.toString());
            resolve(json);
          }
        }
      );
    }
  );
};

export const getImageryExamOrders = (consultationId: string) => {
  return new Promise(
    async (resolve: (value: any) => void, reject: (error: any) => void) => {
      try {
        const orders: ExamOrder[] = [];
        const cursor = stores.imageryExamOrders.find({ consultationId });

        await cursor.forEach((order: ExamOrder) => {
          orders.push(order);
        });

        resolve(orders);
      } catch (e: any) {
        reject(e);
      }
    }
  );
};

ready.then((isAppReady: boolean) => {
  if (!isAppReady) {
    return;
  }

  app.post('/imagery/exams', (req: Request, res: Response) => {
    const data = req.body;
    const examCategories = Object.keys(data).filter((key) =>
      key.startsWith('category:')
    );
    const order: ExamOrder = {
      _id: null,
      consultationId: data.consultationId,
      creationDate: new Date(),
      status: LaboratoryExamOrderStatus.Pending,
      items: examCategories.map((category: string) => {
        return {
          category: category.replace('category:', '').trim(),
          exams: data[category],
        };
      }),
    };

    stores.imageryExamOrders.insertOne(order, (error: MongoError) => {
      if (error) {
        renderErrorPage({
          description: `Impossible d'enregistrer ce bon d'examens. Veuillez contacter votre administrateur`,
          referer: `/consultations/${order.consultationId}`,
          response: res,
          statusCode: Http.InternalServerError,
          summary: `Erreur lors de l'enregistrement du bon d'examen`,
        });
        return;
      }

      res.redirect(`/consultations/${order.consultationId}`);
    });
  });
});
