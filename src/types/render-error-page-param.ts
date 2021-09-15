import { Response } from 'express';

export interface RenderErrorPageParam {
  response: Response;
  referer: string;
  statusCode: number;
  summary: string;
  description: string;
}
