export * from './pending-tab';

import Handlebars from 'handlebars';
import { sidenav } from './sidenav';
import fs from 'fs';
import { deleteConfirmation } from './delete-confirmation';
import { createConsultation } from './create-consultation';
import { paginationScripts } from './pagination-scripts';
import { consultationTab } from './consultation-tab';
import { prescriptionDialog } from './prescription-dialog';
import { examsOrderDialog } from './exams-order-dialog';
import {
  ConsultationStatus,
  ExamOrderItem,
  LaboratoryExamOrderStatus,
} from '../types';
import { imageryExamOrderDialog } from './imagery-order-dialog';
import { nursingTab } from './nursing';
import { pendingTab } from './pending-tab';
import { laboratoryExamOrders } from './laboratory-exam-orders';

export const registerPartials = () => {
  const index = Handlebars.compile(
    fs.readFileSync('src/views/index.hbs').toString()
  );

  Handlebars.registerPartial('index', index);
  Handlebars.registerPartial('sidenav', sidenav);
  Handlebars.registerPartial('delete-confirmation', deleteConfirmation);
  Handlebars.registerPartial('pending-consultation-tab', pendingTab);
  Handlebars.registerPartial('create-consultation', createConsultation);
  Handlebars.registerPartial('pagination-scripts', paginationScripts);
  Handlebars.registerPartial('consultation-tab', consultationTab);
  Handlebars.registerPartial('prescription-dialog', prescriptionDialog);
  Handlebars.registerPartial('exams-order-dialog', examsOrderDialog);
  Handlebars.registerPartial('laboratory-exam-orders', laboratoryExamOrders);
  Handlebars.registerPartial(
    'imagery-exams-order-dialog',
    imageryExamOrderDialog
  );
  Handlebars.registerPartial('nursing-tab', nursingTab);

  Handlebars.registerHelper('times', (times: number, block: any) => {
    let accumulator = '';
    for (let i = 0; i < times; i++) {
      block.data.index = i + 1;
      block.data.first = i === 0;
      block.data.last = i === times - 1;
      block.data.selected = `${block.data.root.selectedPage - 1}` === `${i}`;
      accumulator += block.fn(this);
    }

    return accumulator;
  });

  Handlebars.registerHelper(
    'eachExtended',
    (items: any | string, block: any) => {
      let accumulator = '';

      if (Array.isArray(items)) {
        items?.forEach((item: ExamOrderItem, idx: number) => {
          block.data.first = idx === 0;
          block.data.value = item;
          block.data.length = items.length;
          accumulator += block.fn(item);
        });
      } else {
        block.data.first = true;
        block.data.value = items;
        block.data.length = 1;
        accumulator += block.fn(items);
      }

      return accumulator;
    }
  );

  Handlebars.registerHelper('getReferenceValue', (exam, item, context) => {
    const setting = item.settings.find((s: any) => s.exam === exam)?.setting;

    if (setting) {
      const { referential } = setting;

      if (referential.low && referential.high) {
        return `${referential.prefix || ''}${referential.low} - ${
          referential.prefix || ''
        }${referential.high} ${referential.unit}`;
      } else if (referential.lowerThan) {
        return `<${referential.prefix || ''}${referential.lowerThan} ${
          referential.unit
        }`;
      } else if (referential.equalTo) {
        return `=${referential.prefix || ''}${referential.lowerThan} ${
          referential.unit
        }`;
      } else if (referential.unit) {
        return `${referential.unit}`;
      }
    }
  });

  Handlebars.registerHelper('getStatusIcon', (status: ConsultationStatus) => {
    switch (status) {
      case ConsultationStatus.Cloturee:
        return 'check-square';
      case ConsultationStatus.EnCours:
        return 'play';
      case ConsultationStatus.Nursing:
        return 'activity';
      case ConsultationStatus.Redirigee:
        return 'corner-up-right';
      case ConsultationStatus.EnAttente:
        return 'clock';
      default:
        return 'alert-triangle';
    }
  });

  Handlebars.registerHelper('getStatusTheme', (status: ConsultationStatus) => {
    switch (status) {
      case ConsultationStatus.Cloturee:
        return 'text-theme-9';
      case ConsultationStatus.EnCours:
        return 'text-theme-9';
      case ConsultationStatus.Nursing:
        return 'text-theme-10';
      case ConsultationStatus.Redirigee:
        return 'text-theme-9';
      default:
        return 'text-theme-6';
    }
  });

  Handlebars.registerHelper(
    'getExamStatusTheme',
    (status: LaboratoryExamOrderStatus) => {
      switch (status) {
        case LaboratoryExamOrderStatus.Done:
          return 'text-theme-9';
        case LaboratoryExamOrderStatus.InProgress:
          return 'text-theme-9';
        default:
          return 'text-theme-6';
      }
    }
  );

  Handlebars.registerHelper(
    'getExamStatusIcon',
    (status: LaboratoryExamOrderStatus) => {
      switch (status) {
        case LaboratoryExamOrderStatus.Done:
          return 'check-square';
        case LaboratoryExamOrderStatus.InProgress:
          return 'play';
        case LaboratoryExamOrderStatus.Pending:
          return 'clock';
        default:
          return 'alert-triangle';
      }
    }
  );

  Handlebars.registerHelper('eq', (expected: any, given: any) => {
    return expected === given;
  });
};
