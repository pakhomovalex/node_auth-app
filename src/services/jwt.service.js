import jwt from 'jsonwebtoken';
import 'dotenv/config';

function sigh(user) {
  try {
    const token = jwt.sign(user, process.env.JWT_KEY, {
      expiresIn: '5s',
    });

    return token;
  } catch (error) {
    console.log(error);
    return null;
  }
}

function verify(token) {
  try {
    return jwt.verify(token, process.env.JWT_KEY);
  } catch (e) {
    return null;
  }
}

export const jwtService = {
  sigh,
  verify,
};
