import express from 'express';
import { usersControllers } from '../controllers/user.controllers.js';
import { catchError } from '../catchError.js';

export const userRouter = new express.Router();

userRouter.get('/', catchError(usersControllers.getUser));
userRouter.patch('/changename', catchError(usersControllers.changeName));
userRouter.patch('/changepassword', catchError(usersControllers.changeName));
userRouter.post('/resetpassword', catchError(usersControllers.resetPasswordEmail));
userRouter
  .patch('/resetpassword/:email/:resetPasswordToken', catchError(usersControllers.resetPassword));
userRouter.patch('/changeemail/:oldEmail', catchError(usersControllers.changeEmail));

