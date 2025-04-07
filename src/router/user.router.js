import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { usersControllers } from '../controllers/user.controllers.js';
import { catchError } from '../catchError.js';

export const userRouter = new express.Router();

userRouter.get('/', authMiddleware, catchError(usersControllers.getAllActivated));
