import Sequelize from 'sequelize';

import databaseConfig from '../config/database';

import User from '../app/models/User';
import File from '../app/models/File';
import Meetapp from '../app/models/Meetapp';
import Subscription from '../app/models/Subscription';

const models = [User, File, Meetapp, Subscription];

class Database {
  constructor() {
    this.connection = new Sequelize(databaseConfig);

    this.init();
  }

  init() {
    models.forEach(model => model.init(this.connection));
    models.forEach(
      model => model.associate && model.associate(this.connection.models)
    );
  }
}

export default new Database();
