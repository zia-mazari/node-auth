'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('auth_login_attempts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      ip: {
        type: Sequelize.STRING,
        allowNull: false
      },
      username: {
        type: Sequelize.STRING,
        allowNull: true
      },
      attemptCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      blockCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      blockedUntil: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('auth_login_attempts', ['ip'], {
      name: 'idx_auth_login_attempts_ip'
    });

    await queryInterface.addIndex('auth_login_attempts', ['username'], {
      name: 'idx_auth_login_attempts_username'
    });

    await queryInterface.addIndex('auth_login_attempts', ['blockedUntil'], {
      name: 'idx_auth_login_attempts_blockedUntil'
    });

    // Composite index for common queries
    await queryInterface.addIndex('auth_login_attempts', ['ip', 'username'], {
      name: 'idx_auth_login_attempts_ip_username'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('auth_login_attempts');
  }
};