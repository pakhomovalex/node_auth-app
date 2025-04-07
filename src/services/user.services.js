import { ApiError } from "../exceptions/api.error.js";
import { User } from "../models/User.model.js";
import { emailServeice } from '../services/email.service.js';
import { v4 as uuid } from 'uuid';

const getAllUsers = async () => {
  const users = await User.findAll({
    where: {
      activationToken: null,
    }
  });

  return users;
};

const normilize = (user) => {
  const { email, id } = user;

  return { email, id };
};

const findByEmail = async (email) => {
  const user = await User.findOne({ where: { email }});

  return user;
};

const registration = async (email, password) => {
  const activationToken = uuid();

  const userExist = await findByEmail(email);

  if (userExist) {
    throw ApiError.badRequest('User already exist', {
      email: 'User already exist',
    })
  }

  const user = await User.create({ email, password, activationToken });

  await emailServeice.sendActivationEmail(email, activationToken);

  return user;
}

export const userServices = {
  normilize,
  findByEmail,
  getAllUsers,
  registration,
};
