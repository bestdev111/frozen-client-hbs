import fs from 'fs';
import { cache, CacheKeys, stores } from '../../store';
import {
  ExamOrder,
  LaboratoryExamOrderStatusFormatted,
  Pagination,
} from '../../types';
import axios from 'axios';
import { readTemplateFile } from '../../util';
import { ObjectId } from 'mongodb';
import _ from 'lodash';

export const getLaboratoryExamSettings = async () => {
  let settings = await getLaboratoryExamsSettingsFromCache();

  if (settings === undefined) {
    settings = await getLaboratoryExamsSettingsFromJson();
    cache.set(CacheKeys.ExamsSettings, settings);
  }
  return settings;
};

export const getLaboratoryExamsSettingsFromJson = () => {
  return new Promise(
    (resolve: (value: any) => void, reject: (value: any) => void) => {
      fs.readFile(
        'assets/laboratory.json',
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

const getLaboratoryExamsSettingsFromCache = () => {
  return Promise.resolve(cache.get(CacheKeys.ExamsSettings));
};

export const readLaboratoryOrdersTemplateFile = () => {
  return readTemplateFile('src/views/laboratory-exam-orders.hbs');
};

export const getLaboratoryExams = async (
  paginationState: Pagination,
  statusQuery: any
) => {
  return await stores.laboratoryExamOrders
    .find({ status: statusQuery })
    .skip(paginationState.offset)
    .limit(paginationState.count)
    .toArray();
};

export const getLaboratoryExamsWithConsultations = async (
  paginationState: Pagination,
  statusQuery: any
) => {
  const orders = await getLaboratoryExams(paginationState, statusQuery);
  const consultationIds = orders.map((order) => order.consultationId);
  const { data } = await axios.get(`${process.env.BACKEND_URL}/consultations`, {
    params: { id: consultationIds },
  });

  return orders.map((order) => ({
    ...order,
    formattedStatus: getFormattedStatus(order),
    consultation: data.find(
      (consultation: any) => consultation.id === Number(order.consultationId)
    ),
  }));
};

const getFormattedStatus = (order: ExamOrder) => {
  return LaboratoryExamOrderStatusFormatted[order.status];
};

export const readLaboratoryOrderTemplateFile = async () => {
  return readTemplateFile('src/views/laboratory/laboratory-exam-order.hbs');
};

export const getLaboratoryExam = async (id: string) => {
  const order: ExamOrder | null = await stores.laboratoryExamOrders.findOne({
    _id: new ObjectId(id),
  });
  const orderWithConsultation =
    await assignMatchingConsultationToOrderIfOrderIsTruthy(order);
  const orderWithReferenceValues =
    await assignMatchingReferenceValuesToOrderIfOrderIsTruthy(
      orderWithConsultation
    );

  return orderWithReferenceValues;
};

const assignMatchingConsultationToOrderIfOrderIsTruthy = async (
  order: ExamOrder | null
) => {
  if (order) {
    const { data } = await axios.get(
      `${process.env.BACKEND_URL}/consultations/${order.consultationId}`
    );
    return {
      ...order,
      consultation: data,
    };
  }
  return order;
};

const assignMatchingReferenceValuesToOrderIfOrderIsTruthy = async (
  order: ExamOrder | null
) => {
  if (order) {
    const settings = await getLaboratoryExamSettings();
    const orderItems = order.items?.map((item) => {
      const category = (settings as any)?.find(
        (setting: any) => setting.category === item.category
      );
      return {
        ...item,
        settings: !_.isArray(item.exams)
          ? [
              {
                exam: item.exams,
                setting: category.exams.find((c: any) => c.name === item.exams),
              },
            ]
          : item.exams.map((exam) => {
              return {
                exam,
                setting: category.exams.find((e: any) => e.name === exam),
              };
            }),
      };
    });

    return {
      ...order,
      items: orderItems,
    };
  }

  return order;
};
