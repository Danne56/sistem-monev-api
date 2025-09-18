import express from 'express';
import { getAllUsers } from '../handlers/userHandler.js';

const router = express.Router();

router.get('/users', getAllUsers);

export default router;
