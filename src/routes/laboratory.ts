import { ready, stores } from '../store';
import { app } from './app';
import { Request, Response } from 'express';
import { Http } from '@status/codes';
import {
  ExamOrder,
  LaboratoryExamOrderStatus,
  Pagination,
  RenderErrorPageParam,
} from '../types';
import { MongoError } from 'mongodb';
import { renderErrorPage } from './error';
import { getPagesCount } from '../util';
import {
  getLaboratoryExam,
  getLaboratoryExamsSettingsFromJson,
  getLaboratoryExamsWithConsultations,
  readLaboratoryOrdersTemplateFile,
  readLaboratoryOrderTemplateFile,
} from './lab/utils.';

ready.then((isAppReady) => {
  if (!isAppReady) {
    return;
  }

  app.get('/laboratory/examsTypes', (req: Request, res: Response) => {
    try {
      const result = getLaboratoryExamsSettingsFromJson();
      res.json(result).end();
    } catch (err: any) {
      res.json({ result: 'Error' }).status(Http.InternalServerError);
    }
  });

  app.post('/laboratory/exams', (req: Request, res: Response) => {
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

    stores.laboratoryExamOrders.insertOne(order, (error: MongoError) => {
      if (error) {
        const param: RenderErrorPageParam = {
          summary: `Impossible de sauvegarder le bon d'examens`,
          description: `Une erreur interne est survenue lors de l'enregistrement du bon d'examens. Veuillez contacter votre administrateur système`,
          referer: `/consultations/${data.consultationId}`,
          response: res,
          statusCode: Http.InternalServerError,
        };

        renderErrorPage(param);
        return;
      }

      res.redirect(`/consultations/${data.consultationId}`);
    });
  });

  app.get('/laboratory/exams/:id', async (req: Request, res: Response) => {
    const template = await readLaboratoryOrderTemplateFile();
    const order = await getLaboratoryExam(req.params.id);

    if (!order) {
      console.error('Cannot find the laboratory exam of the specified id');
      res.sendStatus(Http.NotFound);
      return;
    }

    res.send(template({ order }));
  });

  app.get('/laboratory/exams', async (req: Request, res: Response) => {
    const statusQuery = {
      $in: [
        LaboratoryExamOrderStatus.Pending,
        LaboratoryExamOrderStatus.InProgress,
      ],
    };
    const paginationState: Pagination = req.body.pagination;
    const ordersCount = await stores.laboratoryExamOrders.count({
      status: statusQuery,
    });
    const pages = getPagesCount(ordersCount, paginationState.pageSize);
    const template = await readLaboratoryOrdersTemplateFile();
    const orders = await getLaboratoryExamsWithConsultations(
      paginationState,
      statusQuery
    );

    res.send(
      template({
        orders,
        offset: paginationState.offset,
        count: paginationState.offset + orders.length,
        total: ordersCount,
        pages,
        selectedPage: paginationState.selectedPage,
        pageSize: paginationState.pageSize,
      })
    );
  });
});
