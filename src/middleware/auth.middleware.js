import { jwtService } from "../services/jwt.service.js";
import 'dotenv/config';

export const authMiddleware = (req, res, next) => {
  const authorisation = req.headers['authorisation'] || '';

  const [, token] = authorisation.split(' ');

  if (!authorisation || !token) {
    res.sendStatus(401);
    return;
  }

  const userData = jwtService.verify(token, process.env.JWT_KEY);

  if (!userData) {
    res.sendStatus(401);
    return;
  }

  next();
};
