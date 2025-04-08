import { User } from '../models/User.model.js';
import { userServices } from '../services/user.services.js';
import { jwtService } from '../services/jwt.service.js';
import { ApiError } from '../exceptions/api.error.js';
import bcrypt from 'bcrypt';
import { tokenService } from '../services/token.service.js';

const EMAIL_PATTERN = /^[\w.+-]+@([\w-]+\.){1,3}[\w-]{2,}$/;

function validateEmail(value) {
  if (!value) return 'Email is required';
  if (!EMAIL_PATTERN.test(value)) return 'Email is not valid';
}

function validatePassword(value) {
  if (!value) return 'Password is required';
  if (value.length < 6) return 'At least 6 characters';
}

const registration = async (req, res) => {
  const { email, password } = req.body;

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
  }

  if (errors.email || errors.password) {
    throw ApiError.badRequest('Use correct values', errors);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  console.log(hashedPassword);


  const user = await userServices.registration(email, hashedPassword);

  res.status(200).send(user);
};

const activate = async (req, res) => {
  const { activationToken } = req.params;

  const user = await User.findOne({ where: { activationToken } });

  if (!user) {
    res.status(404).send('Cannot find user');
    return;
  }

  user.activationToken = null;
  await user.save();

  res.send(user);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  console.log(email, password);


  const user = await userServices.findByEmail(email);

  if (!user) {
    throw ApiError.badRequest('User doues not exist');
  }

  const isPasswordValid = bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  await generateTokens(res, user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  const user = jwtService.refreshVerify(refreshToken);

  const token = tokenService.getByToken(refreshToken);

  if (!user || !token) {
    throw ApiError.unauthorized();
  }

  const data = await generateTokens(res, user);

  res.status(200).send(data);
};

const generateTokens = async (res, user) => {
  const normalizedUser = userServices.normilize(user);

  const accessToken = jwtService.sigh(normalizedUser);
  const refreshToken = jwtService.refreshSigh(normalizedUser);

  await tokenService.save(normalizedUser.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    HttpOnly: true
  })
  res.send({
    user: normalizedUser,
    accessToken,
  })
};

export const authControllers = {
  registration,
  activate,
  login,
  refresh,
};
