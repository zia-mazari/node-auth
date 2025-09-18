'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('Admin123*', 10);
    const now = new Date();
    
    // Create three test users
    await queryInterface.bulkInsert('users', [
      {
        id: uuidv4(),
        username: 'mazari',
        email: 'mazari.zia@gmail.com',
        password: hashedPassword,
        isVerified: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        username: 'testuser1',
        email: 'testuser1@example.com',
        password: hashedPassword,
        isVerified: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        username: 'testuser2',
        email: 'testuser2@example.com',
        password: hashedPassword,
        isVerified: true,
        createdAt: now,
        updatedAt: now
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};