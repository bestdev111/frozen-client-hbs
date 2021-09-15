export enum LaboratoryExamOrderStatus {
  Pending = 'Pending',
  InProgress = 'InProgress',
  Done = 'Done',
}

export const LaboratoryExamOrderStatusFormatted = {
  [LaboratoryExamOrderStatus.Done]: 'Achêvé',
  [LaboratoryExamOrderStatus.InProgress]: 'En cours',
  [LaboratoryExamOrderStatus.Pending]: 'En attente',
};
