/* eslint-disable no-console */
import { sequelize } from '../db.js';

export async function sequelizeSync() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    await sequelize.sync();
    console.log('Table created');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}
