import { Response } from 'express';

export const finalResponse = (
  res: Response,
  statusCode: number,
  ...rest: any
) => {
  res.status(statusCode).json({
    status: true,
    code: statusCode,
    ...rest[0],
  });
};
