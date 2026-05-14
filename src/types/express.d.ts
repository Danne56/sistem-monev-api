import type { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
      file?: Express.Multer.File;
    }
  }
}

export {};
