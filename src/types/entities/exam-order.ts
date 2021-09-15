import { LaboratoryExamOrderStatus } from '../laboratory-exam-status.enum';
import { Entity } from './entity';

export interface ExamOrderItem {
  category: string;
  exams: string[];
}

export interface ExamOrder extends Entity {
  consultationId: string;
  items?: ExamOrderItem[];
  creationDate: Date;
  status: LaboratoryExamOrderStatus;
}
