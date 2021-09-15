import Handlebars from 'handlebars';
import { Request, Response } from 'express';
import { app } from './app';
import fs from 'fs';
import axios from 'axios';
import { ready } from '../store';
import _ from 'lodash';
import { getPagesCount } from '../util';

const formatStatus = (status: string) => {
  switch (status) {
    case 'NURSING':
      return 'Nursing';
    case 'EN_COURS':
      return 'En cours';
    case 'EN_ATTENTE':
      return 'En attente';
    case 'CLOTUREE':
      return 'Clôturée';
    case 'REDIRIGEE':
      return 'Redirigée';
    default:
      return 'Inconnu';
  }
};

const formatConsultations = (consultations: any[]) => {
  return consultations.map((consultation) => {
    return {
      ...consultation,
      statusFormatted: formatStatus(consultation.status),
    };
  });
};

const readConsultationsTemplateFile = () => {
  return new Promise(
    (
      resolve: (template: any) => void,
      reject: (error: NodeJS.ErrnoException) => void
    ) => {
      fs.readFile(
        'src/views/consultations.hbs',
        (error: NodeJS.ErrnoException | null, data: Buffer) => {
          if (error) {
            reject(error);
            return;
          }

          const template = Handlebars.compile(data.toString());
          resolve(template);
        }
      );
    }
  );
};

const queryConsultationsCount = async (scope: string) => {
  const scopeQuery =
    scope === 'EN_ATTENTE'
      ? 'status=EN_ATTENTE&status=EN_COURS'
      : `status=${scope}`;

  const { data } = !scope
    ? await axios.get(`http://localhost:8086/stats/consultations/count`)
    : await axios.get(
        `http://localhost:8086/stats/consultations/count?${scopeQuery}`
      );

  return data.count;
};

const queryConsultations = async (
  scope: string,
  pagination: { count: number; offset: number }
) => {
  const scopeQuery =
    scope === 'EN_ATTENTE'
      ? 'status=EN_ATTENTE&status=EN_COURS'
      : `status=${scope}`;
  const { data } = !scope
    ? await axios.get(
        `http://localhost:8086/consultations?&offset=${pagination.offset}&count=${pagination.count}`
      )
    : await axios.get(
        `http://localhost:8086/consultations?${scopeQuery}&offset=${pagination.offset}&count=${pagination.count}`
      );

  return data;
};

const queryConsultationsByScope = async (
  scope: string,
  req: Request,
  res: Response
) => {
  const paginationState = req.body.pagination;
  const template = await readConsultationsTemplateFile();
  const consultationsCount = await queryConsultationsCount(scope);
  const consultations = await queryConsultations(scope, paginationState);
  const pages = getPagesCount(consultationsCount, paginationState.pageSize);

  res.send(
    template({
      consultations: formatConsultations(consultations),
      offset: paginationState.offset,
      count: paginationState.offset + consultations.length,
      total: consultationsCount,
      pages,
      selectedPage: paginationState.selectedPage,
      pageSize: paginationState.pageSize,
    })
  );
};

ready.then((isAppReady: boolean) => {
  if (!isAppReady) {
    return;
  }

  app.get('/nursing/consultations', (req: Request, res: Response) => {
    const scope = 'NURSING';
    queryConsultationsByScope(scope, req, res);
  });

  app.get('/box/consultations', (req: Request, res: Response) => {
    const scope = 'EN_ATTENTE';
    queryConsultationsByScope(scope, req, res);
  });

  app.put(
    '/consultations/:id/signes_vitaux',
    async (req: Request, res: Response) => {
      const consultationId = req.params.id;
      const vitalSigns = {
        consultationId,
        ...req.body,
      };

      axios.post('http://localhost:8086/signes_vitaux', vitalSigns).then(() => {
        res.redirect('/nursing/consultations');
      });
    }
  );
});
