const { Sequelize, Model } = require("sequelize");
const sqlite = new Sequelize('db', 'aisk', 'ksia', {
  dialect: 'sqlite',
  storage: `${__dirname}/db.sqlite`,
  // logging: false,
});

//定义模型
const User = sqlite.define('user', {
  id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  tokens: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  data: {
    type: Sequelize.JSON,
    allowNull: false,
    defaultValue: {}
  },
});

const $account = {

  sqlite,
  User,

  /**
   * 创建用户/key
   * @param {*} ps 
   * @returns {Model} user
   */
  async findOrCreate(id, tokens = 0, data = {} ){
    return await User.findOrCreate({
      where: { id  },
      defaults: { tokens, data }
    }).then( ([user,created])=> user )
  },
  
  /**
   * 记录change并更改user.tokens
   * @param {*} key 
   * @param {*} total 
   * @param {*} why 
   * @returns {Change}
   */
  async change( id, total ){
    return await User.update(
      {  tokens: Sequelize.literal(`tokens + ${total}`) },
      { where: { id } },
    );
  },

}

module.exports = $account;