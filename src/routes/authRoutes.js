import express from 'express';
import jwt from 'jsonwebtoken';
import { forgotPassword } from '../handlers/forgotPasswordHandler.js';
import { loginUser } from '../handlers/loginHandler.js';
import { logoutUser } from '../handlers/logoutHandler.js';
import { resetPassword } from '../handlers/resetPasswordHandler.js';
import { registerUser } from '../handlers/userHandler.js';
import { verifyAccount } from '../handlers/verifyAccountHandler.js';
import { verifyResetCode } from '../handlers/verifyResetCodeHandler.js';
import {
  authenticateToken,
  checkRole,
  verifyToken,
} from '../middleware/authMiddleware.js';
import { checkTokenBlacklist } from '../middleware/checkTokenBlacklist.js';
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/password', forgotPassword);
router.put('/password', resetPassword);
router.post('/password/verify', verifyResetCode);
router.post('/logout', authenticateToken, checkTokenBlacklist, logoutUser);
router.put(
  '/verify/:email',
  authenticateToken,
  checkRole('admin'),
  verifyAccount
);
router.get('/me', authenticateToken, verifyToken);

// Hanya di development
if (process.env.NODE_ENV === 'development') {
  router.post('/mock-login', (req, res) => {
    // Data user dummy
    const mockUser = {
      id: 999,
      username: 'dev_admin',
      role: 'admin',
      email: 'dev@example.com',
    };

    // Generate token (gunakan secret key development)
    const token = jwt.sign(
      mockUser,
      process.env.JWT_SECRET_DEV || 'dev-secret'
    );

    res.json({
      status: 'success',
      token,
      user: mockUser,
    });
  });
}

export default router;
