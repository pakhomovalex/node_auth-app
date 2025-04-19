import { ApiError } from "../exceptions/api.error.js";
import { ResetPasswordToken } from "../models/resetPasswordToken.js";
import { emailService } from "../services/email.service.js";
import { jwtService } from "../services/jwt.service.js";
import { userServices } from "../services/user.services.js";
import bcrypt from 'bcrypt';

const getUser = async (req, res) => {
  const { refreshToken } = req.cookies;

  const user = await userServices.getUser(refreshToken);

  res.status(200).send(user);
};

const changeName = async (req, res) => {
  const { refreshToken } = req.cookies;
  const { name } = req.body;

  const user = await userServices.getUser(refreshToken);

  user.name = name;
  await user.save();

  res.status(201).send(user);
};

const changePassword = async (req, res) => {
  const { refreshToken } = req.cookies;
  const { oldPassword, newPassword } = req.body;

  const user = await userServices.getUser(refreshToken);

  const isPasswordValid = bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Wrong password');
  }

  user.password = bcrypt.hash(newPassword);
  await user.save();

  res.status(201).send(user);
};

const resetPasswordEmail = async (req, res) => {
  const { email } = req.body;

  const user = await userServices.findByEmail(email);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const normilizedUser = userServices.normilize(user);

  const resetToken = jwtService.resetPasswordToken(normilizedUser);

  await ResetPasswordToken.create({
    resetPasswordToken: resetToken,
    UserId: user.id,
  })

  emailService.sendResetEmail(email, resetToken);

  res.sendStatus(200);
};

const resetPassword = async (req, res) => {
  const { email, resetPasswordToken } = req.params;
  const { newPassword } = req.body;

  const user = await userServices.findByEmail(email);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const tokenRecord = await ResetPasswordToken.findOne({
    where: {
      UserId: user.id,
      resetPasswordToken: resetPasswordToken
    }
  });

  if (!tokenRecord) {
    return res.status(400).send('Invalid or expired token');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.sendStatus(200);
};

const changeEmail = async (req, res) => {
  const { password, newEmail } = req.body;
  const { oldEmail } = req.params;

  const user = await userServices.findByEmail(oldEmail);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const userPassword = bcrypt.compare(user.password);

  if (userPassword !== password) {
    res.status(400).send('Wrong password');
  }

  const normilizedUser = userServices.normilize(user);

  user.email = newEmail;
  await user.save();

  user.activationToken = jwtService.sigh(normilizedUser);
  await user.save();

  await emailService.sendActivationEmail(newEmail, user.activationToken);

  const html = `Your email was changed on ${newEmail}`;
  await emailService.send({ oldEmail, subject: 'Email was changed', html });

  res.sendStatus(200);
};

export const usersControllers = {
  getUser,
  changeName,
  changePassword,
  resetPasswordEmail,
  resetPassword,
  changeEmail,
};
