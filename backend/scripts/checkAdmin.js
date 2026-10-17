const bcrypt = require('bcryptjs');
const { sequelize } = require('../src/models');
const Admin = require('../src/models').Admin;

async function checkAdmin() {
  try {
    // Connect to the database
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment');
    }

    // Find or create the admin account
    let admin = await Admin.findOne({ 
      where: { email: adminEmail } 
    });

    if (!admin) {
      console.log('Admin account not found. Creating new admin account...');
      
      // Create new admin
      admin = await Admin.create({
        email: adminEmail,
        password: adminPassword, // This will be hashed by the beforeCreate hook
        name: 'Admin',
        isActive: true,
        loginAttempts: 0,
        lockUntil: null
      });
      
      console.log('Admin account created successfully!');
    } else {
      console.log('\n=== ADMIN ACCOUNT DETAILS ===');
      console.log('ID:', admin.id);
      console.log('Email:', admin.email);
      console.log('Name:', admin.name);
      console.log('Is Active:', admin.isActive);
      console.log('Login Attempts:', admin.loginAttempts);
      console.log('Locked Until:', admin.lockUntil);
      console.log('Password Hash:', admin.password);
      console.log('Password Hash Length:', admin.password.length);

      // Test password verification
      console.log('\n=== PASSWORD VERIFICATION ===');
      console.log('Testing password...');
      
      const isMatch = await bcrypt.compare(adminPassword, admin.password);
      console.log('Password match:', isMatch);

      if (!isMatch) {
        console.log('\n=== UPDATING PASSWORD ===');
        console.log('Password mismatch. Updating password hash...');
        
        // Update the password (will be hashed by the beforeUpdate hook)
        admin.password = adminPassword;
        await admin.save();
        
        console.log('Admin password updated successfully!');
      }
    }

    // Final verification
    console.log('\n=== FINAL VERIFICATION ===');
    const finalCheck = await Admin.findOne({ where: { email: adminEmail } });
    const finalMatch = await bcrypt.compare(adminPassword, finalCheck.password);
    console.log('Final password verification:', finalMatch ? 'SUCCESS' : 'FAILED');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkAdmin();
