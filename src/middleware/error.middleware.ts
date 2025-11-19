import BaseError from '../libs/utils/base.error';
import { Request, Response, NextFunction } from 'express';

interface ErrorResponse {
  message: string;
  errors?: any;
}

interface CustomError extends Error {
  status: number;
  errors?: any;
}

export default function (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof BaseError) {
    const response: ErrorResponse = { message: err.message, errors: err.errors };
    return res.status(err.status).json(response);
  }

  const response: ErrorResponse = { message: err.message };
  return res.status(500).json(response);
}