'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('auth_password_resets', {
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
        allowNull: false,
        validate: {
          isEmail: true
        }
      },
      verificationCode: {
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
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for performance
    await queryInterface.addIndex('auth_password_resets', ['userId'], {
      name: 'idx_auth_password_resets_user_id'
    });
    
    await queryInterface.addIndex('auth_password_resets', ['email'], {
      name: 'idx_auth_password_resets_email'
    });
    
    await queryInterface.addIndex('auth_password_resets', ['verificationCode'], {
      name: 'idx_auth_password_resets_verification_code'
    });
    
    await queryInterface.addIndex('auth_password_resets', ['expiresAt'], {
      name: 'idx_auth_password_resets_expires_at'
    });
    
    await queryInterface.addIndex('auth_password_resets', ['used'], {
      name: 'idx_auth_password_resets_used'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('auth_password_resets');
  }
};