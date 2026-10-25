'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required to seed an admin');
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    const adminUser = {
      id: '550e8400-e29b-41d4-a716-446655440000', // Fixed UUID for consistency
      name: 'Admin User',
      email: adminEmail,
      password: hashedPassword,
      isActive: true,
      role: 'admin',
      loginAttempts: 0,
      lockUntil: null,
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Check if admin user already exists
    const existingAdmin = await queryInterface.rawSelect('Admins', {
      where: { email: adminUser.email },
    }, ['id']);

    if (!existingAdmin) {
      await queryInterface.bulkInsert('Admins', [adminUser], {});
      console.log('✅ Admin user created successfully');
      console.log('📧 Admin email configured from environment');
    } else {
      console.log('ℹ️  Admin user already exists');
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Admins', {
      email: process.env.ADMIN_EMAIL || 'admin@findtheweb.zus3cu.tech'
    }, {});
  }
};
