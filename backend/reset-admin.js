const { sequelize, Admin } = require('./src/models');
const bcrypt = require('bcryptjs');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// Password strength requirements
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true
};

const validatePassword = (password) => {
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    return `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`;
  }
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    return 'Password must contain at least one number';
  }
  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password must contain at least one special character';
  }
  return null;
};

const prompt = (question) => {
  return new Promise((resolve) => {
    readline.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
};

const resetAdmin = async (email, newPassword) => {
  try {
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Invalid email format');
    }

    // Validate password
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      throw new Error(`Password validation failed: ${passwordError}`);
    }

    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✓ Database connection established');

    // Find the admin
    console.log(`Searching for admin: ${email}`);
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      throw new Error(`Admin with email ${email} not found`);
    }

    // Get confirmation
    const confirm = await prompt(`Are you sure you want to reset the password for ${email}? (y/N) `);
    if (confirm.toLowerCase() !== 'y') {
      console.log('Password reset cancelled');
      process.exit(0);
    }

    // Hash the new password with increased salt rounds
    console.log('Hashing new password...');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the admin's password and reset security fields
    admin.password = hashedPassword;
    admin.loginAttempts = 0;
    admin.lockUntil = null;
    admin.updatedAt = new Date();
    
    console.log('Updating admin record...');
    await admin.save();

    console.log('\n✅ Admin password has been reset successfully');
    console.log('----------------------------------------');
    console.log(`Email: ${email}`);
    console.log('Password has been updated successfully');
    console.log('----------------------------------------');
    console.log('Please ensure you keep this password secure and change it after first login.\n');

  } catch (error) {
    console.error('\n❌ Error resetting admin password:');
    console.error(error.message);
    process.exit(1);
  } finally {
    readline.close();
    await sequelize.close();
  }
};

// Get command line arguments or prompt for them
const getArgs = async () => {
  let email = process.argv[2];
  let password = process.argv[3];

  if (!email) {
    email = await prompt('Enter admin email (default: admin@findtheweb.com): ');
    email = email || 'admin@findtheweb.com';
  }

  if (!password) {
    password = await prompt('Enter new password: ');
    if (!password) {
      console.error('Error: Password cannot be empty');
      process.exit(1);
    }
  }

  return { email, password };
};

// Main execution
(async () => {
  try {
    const { email, password } = await getArgs();
    await resetAdmin(email, password);
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
})();