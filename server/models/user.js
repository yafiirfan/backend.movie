'use strict';
const {
  Model
} = require('sequelize');
const { hash } = require('../helpers/bcrypt');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "username is required",
        },
        notEmpty: {
          msg: "username is required",
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      unique: {
        args: true,
        msg: "Email must be unique"
      },
      allowNull: false,
      validate: {
        notNull: {
          msg: "Email is required"
        },
        notEmpty: {
          msg: "Email is required"
        },
        isEmail: {
          msg: "Invalid email format"
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Password is required"
        },
        notEmpty: {
          msg: "Password is required"
        }
      }
    },
    imageUrl: {
      type: DataTypes.STRING,
    }
  }, {
    hooks: {
      beforeCreate: (user) => {
        user.password = hash(user.password);
      },
    },
    sequelize,
    modelName: "User",
  });
  return User;
};