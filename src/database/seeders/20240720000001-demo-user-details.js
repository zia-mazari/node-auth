'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, get the user IDs from the users table
    const users = await queryInterface.sequelize.query(
      'SELECT id, email FROM users WHERE email IN (:emails)',
      {
        replacements: { emails: ['mazari.zia@gmail.com', 'testuser1@example.com', 'testuser2@example.com'] },
        type: Sequelize.QueryTypes.SELECT
      }
    );

    const now = new Date();
    const userDetails = [];

    // Create user details for each user
    for (const user of users) {
      userDetails.push({
        id: uuidv4(),
        user_id: user.id,
        first_name: user.email === 'mazari.zia@gmail.com' ? 'Mazari' : 
                   user.email === 'testuser1@example.com' ? 'Test' : 'Demo',
        last_name: user.email === 'mazari.zia@gmail.com' ? 'Zia' : 
                  user.email === 'testuser1@example.com' ? 'User1' : 'User2',
        gender: user.email === 'mazari.zia@gmail.com' ? 'male' : 
               user.email === 'testuser1@example.com' ? 'female' : 'other',
        date_of_birth: null,
        phone_number: null,
        profile_picture: null,
        created_at: now,
        updated_at: now
      });
    }

    await queryInterface.bulkInsert('user_details', userDetails);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('user_details', null, {});
  }
};