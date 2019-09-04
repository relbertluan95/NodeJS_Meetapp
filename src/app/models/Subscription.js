import { Model } from 'sequelize';

class Subscription extends Model {
  static init(sequelize) {
    super.init(
      {},
      {
        sequelize,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id' });
    this.belongsTo(models.Meetapp, {
      foreignKey: 'meetapp_id',
    });
  }
}

export default Subscription;
