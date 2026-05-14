import jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';

type JwtPayload = {
  id?: string | number;
  fullname?: string;
  email?: string;
  role?: string;
};

type AuthenticatedRequest = Request & { user?: JwtPayload };

const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Ambil token dari header
  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'Akses ditolak. Token tidak ditemukan.',
    });
  }

  try {
    // Gunakan secret sesuai environment
    const secret =
      process.env.NODE_ENV === 'development'
        ? process.env.JWT_SECRET_DEV
        : process.env.JWT_SECRET;

    if (!secret) {
      return res.status(500).json({
        status: 'error',
        message: 'Secret key tidak tersedia.',
      });
    }

    const verified = jwt.verify(token, secret) as JwtPayload;
    req.user = verified; // Simpan informasi user ke `req`
    next();
  } catch {
    return res
      .status(403)
      .json({ status: 'fail', message: 'Token tidak valid' });
  }
};

const checkRole = (requiredRole: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Skip role check in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] Skipping role check for ${requiredRole}`);
      return next();
    }

    // Proceed with role check in production
    const userRole = req.user?.role;
    if (!userRole || userRole !== requiredRole) {
      return res.status(403).json({
        status: 'fail',
        message: `Hanya role ${requiredRole} yang dapat mengakses endpoint ini.`,
      });
    }
    next();
  };
};

const verifyToken = async (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({
    status: 'success',
    data: req.user, // Data user dari JWT
  });
};

export { authenticateToken, checkRole, verifyToken };
