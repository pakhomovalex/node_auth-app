import express from 'express';
import { authControllers } from '../controllers/auth.controllers.js';
import { catchError } from '../catchError.js';

export const router = new express.Router();

router.post('/registration', catchError(authControllers.registration));
router.get('/activate/:email/:activationToken', catchError(authControllers.activate));
// router.get('/activation/:email/:activationToken', (req, res) => {console.log(12345);
// });
router.post('/login', catchError(authControllers.login));
