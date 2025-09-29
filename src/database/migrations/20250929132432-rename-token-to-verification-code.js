'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Rename 'token' column to 'verificationCode' in password_reset_tokens table
    await queryInterface.renameColumn('password_reset_tokens', 'token', 'verificationCode');
    
    // Update the index name to reflect the new column name
    await queryInterface.removeIndex('password_reset_tokens', 'idx_password_reset_tokens_token');
    await queryInterface.addIndex('password_reset_tokens', ['verificationCode'], {
      name: 'idx_password_reset_tokens_verificationCode'
    });
  },

  async down (queryInterface, Sequelize) {
    // Revert: rename 'verificationCode' column back to 'token'
    await queryInterface.renameColumn('password_reset_tokens', 'verificationCode', 'token');
    
    // Revert the index name back to original
    await queryInterface.removeIndex('password_reset_tokens', 'idx_password_reset_tokens_verificationCode');
    await queryInterface.addIndex('password_reset_tokens', ['token'], {
      name: 'idx_password_reset_tokens_token'
    });
  }
};
