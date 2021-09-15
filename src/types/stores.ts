import { Collection } from 'mongodb';
import { ExamOrder, Prescription } from './entities';

export interface Stores {
  prescriptions: Collection<Prescription>;
  laboratoryExamOrders: Collection<ExamOrder>;
  imageryExamOrders: Collection;
}
