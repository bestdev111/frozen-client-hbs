import { Entity } from './entity';

export interface Prescription extends Entity {
  consultationId?: string;
  patientId?: string;
  departementId: string;
  items?: any[];
}
