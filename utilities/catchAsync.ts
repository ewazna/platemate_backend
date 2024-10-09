import { Request, Response, NextFunction } from "express";

export default function catchAsync(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return function (req: Request, res: Response, next: NextFunction) {
    fn(req, res, next).catch((err: Error) => next(err));
  };
}
