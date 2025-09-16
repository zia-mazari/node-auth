'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('Test@123', 10);
    return queryInterface.bulkInsert('Users', [{
      id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};