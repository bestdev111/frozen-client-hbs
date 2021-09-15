import { NextFunction, Request, Response } from 'express';

export const buildPaginationState = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { pageSize, selectedPage } = req.query;
  const offset =
    pageSize && selectedPage
      ? Number(pageSize) * (Number(selectedPage) - 1)
      : 0;
  const count = pageSize ? Number(pageSize) : 10;

  req.body.pagination = {
    offset,
    count,
    selectedPage: selectedPage ? selectedPage : 1,
    pageSize: pageSize ? Number(pageSize) : 10,
  };

  next();
};

export const getPagesCount = (total: number, pageSize: number) => {
  return Math.ceil(total / (pageSize ? Number(pageSize) : 10));
};
