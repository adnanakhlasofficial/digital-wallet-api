import { Response } from "express";

interface meta {
  limit: number;
  currentPage: number;
  totalPages: number;
  [key: string]: number;
}

interface responseData<T> {
  status: number;
  success: boolean;
  message: string;
  data?: T;
  meta?: meta;
}

export const sendResponse = <T>(res: Response, data: responseData<T>) => {
  res.status(data.status).json({
    success: data.success,
    message: data.message,
    ...(data.data && { data: data.data }),
    ...(data.meta && { meta: data.meta }),
  });
};
