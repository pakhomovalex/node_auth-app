import { userServices } from "../services/user.services.js";

const getAllActivated = async (req, res) => {
  const users = await userServices.getAllUsers();

  return users;
};

export const usersControllers = {
  getAllActivated,
};
