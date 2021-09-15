import { RequestHandler } from 'express';
import { buildPaginationState } from '../util';

export const pagination = (): RequestHandler => buildPaginationState;
