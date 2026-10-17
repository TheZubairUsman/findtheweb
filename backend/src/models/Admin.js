const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define('Admin', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 100],
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Administrator',
      validate: {
        len: [1, 100],
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    loginAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lockUntil: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    hooks: {
      beforeCreate: async (admin) => {
        if (admin.password) {
          console.log('Hashing password for new admin:', admin.email);
          const salt = await bcrypt.genSalt(12);
          admin.password = await bcrypt.hash(admin.password, salt);
          console.log('Password hashed successfully');
        }
      },
      beforeUpdate: async (admin) => {
        if (admin.changed('password')) {
          console.log('Updating password hash for admin:', admin.email);
          const salt = await bcrypt.genSalt(12);
          admin.password = await bcrypt.hash(admin.password, salt);
          console.log('Password updated successfully');
        }
      },
    },
    scopes: {
      withoutPassword: {
        attributes: { exclude: ['password'] },
      },
    },
  });

  // Instance methods
  Admin.prototype.comparePassword = async function(candidatePassword) {
    console.log('Comparing passwords...');
    console.log('Stored hash:', this.password);
    console.log('Input password:', candidatePassword);
    
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('Password match:', isMatch);
    
    return isMatch;
  };

  // Increment login attempts and lock account if needed
  Admin.prototype.incrementLoginAttempts = async function() {
    const MAX_LOGIN_ATTEMPTS = 5;
    const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    
    // If this is first failed attempt, initialize or reset attempts
    if (!this.loginAttempts) {
      this.loginAttempts = 1;
    } else {
      this.loginAttempts += 1;
    }
    
    // Lock the account if max attempts reached
    if (this.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      this.lockUntil = Date.now() + LOCK_TIME;
    }
    
    // Save the updated attempts and lock status
    await this.save();
    
    return this;
  };

  // Reset login attempts after successful login
  Admin.prototype.resetLoginAttempts = async function() {
    // Only reset if there were previous attempts
    if (this.loginAttempts > 0 || this.lockUntil) {
      this.loginAttempts = 0;
      this.lockUntil = null;
      await this.save();
    }
    return this;
  };

  // Check if account is currently locked
  Admin.prototype.isLocked = function() {
    return this.lockUntil && this.lockUntil > Date.now();
  };

  // Generate JWT token for authentication
  Admin.prototype.generateJWT = function() {
    const payload = {
      id: this.id,
      email: this.email,
      isAdmin: true
    };

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is required to issue an admin token');
    }

    return jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { 
        expiresIn: '1d',
        issuer: 'findtheweb-admin',
        audience: 'findtheweb-admin-ui'
      }
    );
  };

  return Admin;
};
