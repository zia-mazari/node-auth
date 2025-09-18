'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_details', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'userId',
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'firstName'
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'lastName'
      },
      gender: {
        type: Sequelize.ENUM('male', 'female', 'other'),
        allowNull: true
      },
      dateOfBirth: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        field: 'dateOfBirth'
      },
      phoneNumber: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'phoneNumber'
      },
      profilePicture: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'profilePicture'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'createdAt'
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'updatedAt'
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_details');
  }
};