'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING,
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
        type: Sequelize.STRING,
        unique: {
          args: true,
          msg: "Email must be unique",
        },
        allowNull: false,
        validate: {
          notNull: {
            msg: "Email is required",
          },
          notEmpty: {
            msg: "Email is required",
          },
          isEmail: {
            msg: "Invalid email format",
          },
        },
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Password is required",
          },
          notEmpty: {
            msg: "Password is required",
          },
        },
      },
      imageUrl: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};