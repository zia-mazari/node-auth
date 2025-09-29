'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('password_reset_tokens', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      token: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      used: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('password_reset_tokens', ['token'], {
      name: 'idx_password_reset_tokens_token'
    });
    await queryInterface.addIndex('password_reset_tokens', ['email'], {
      name: 'idx_password_reset_tokens_email'
    });
    await queryInterface.addIndex('password_reset_tokens', ['userId'], {
      name: 'idx_password_reset_tokens_userId'
    });
    await queryInterface.addIndex('password_reset_tokens', ['expiresAt'], {
      name: 'idx_password_reset_tokens_expiresAt'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('password_reset_tokens');
  }
};
