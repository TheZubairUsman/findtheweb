module.exports = (sequelize, DataTypes) => {
  const Settings = sequelize.define('Settings', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [1, 255],
        notEmpty: true,
      },
    },
    value: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'general',
      validate: {
        len: [1, 100],
      },
    },
    dataType: {
      type: DataTypes.ENUM('string', 'number', 'boolean', 'object', 'array'),
      allowNull: false,
      defaultValue: 'string',
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    validation: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  }, {
    hooks: {
      beforeCreate: (setting) => {
        // Auto-detect data type based on value
        if (!setting.dataType) {
          setting.dataType = detectDataType(setting.value);
        }
      },
      beforeUpdate: (setting) => {
        // Auto-detect data type if value changed
        if (setting.changed('value') && !setting.changed('dataType')) {
          setting.dataType = detectDataType(setting.value);
        }
      },
    },
    scopes: {
      public: {
        where: {
          isPublic: true,
        },
      },
      byCategory: (category) => ({
        where: {
          category,
        },
      }),
      required: {
        where: {
          isRequired: true,
        },
      },
    },
  });

  // Helper function to detect data type
  function detectDataType(value) {
    if (value === null || value === undefined) return 'string';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return 'string';
  }

  // Instance methods
  Settings.prototype.getValue = function() {
    return this.value;
  };

  Settings.prototype.setValue = function(newValue) {
    this.value = newValue;
    this.dataType = detectDataType(newValue);
    return this;
  };

  Settings.prototype.getTypedValue = function() {
    switch (this.dataType) {
      case 'boolean':
        return Boolean(this.value);
      case 'number':
        return Number(this.value);
      case 'array':
        return Array.isArray(this.value) ? this.value : [];
      case 'object':
        return typeof this.value === 'object' ? this.value : {};
      default:
        return String(this.value);
    }
  };

  Settings.prototype.isValid = function() {
    if (this.isRequired && (this.value === null || this.value === undefined || this.value === '')) {
      return false;
    }

    // Apply custom validation if provided
    if (this.validation) {
      return validateValue(this.value, this.validation);
    }

    return true;
  };

  // Helper function for custom validation
  function validateValue(value, rules) {
    if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
      return false;
    }
    if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
      return false;
    }
    if (rules.min && typeof value === 'number' && value < rules.min) {
      return false;
    }
    if (rules.max && typeof value === 'number' && value > rules.max) {
      return false;
    }
    if (rules.pattern && typeof value === 'string' && !new RegExp(rules.pattern).test(value)) {
      return false;
    }
    if (rules.required && (value === null || value === undefined || value === '')) {
      return false;
    }
    return true;
  }

  // Class methods
  Settings.get = async function(key, defaultValue = null) {
    try {
      const setting = await this.findOne({ where: { key } });
      return setting ? setting.getValue() : defaultValue;
    } catch (error) {
      console.error('Error getting setting:', error);
      return defaultValue;
    }
  };

  Settings.set = async function(key, value, options = {}) {
    try {
      const { description, category = 'general', isPublic = false, isRequired = false, validation } = options;
      
      const [setting, created] = await this.findOrCreate({
        where: { key },
        defaults: {
          key,
          value,
          description,
          category,
          isPublic,
          isRequired,
          validation,
        },
      });

      if (!created) {
        setting.setValue(value);
        if (description !== undefined) setting.description = description;
        if (category !== undefined) setting.category = category;
        if (isPublic !== undefined) setting.isPublic = isPublic;
        if (isRequired !== undefined) setting.isRequired = isRequired;
        if (validation !== undefined) setting.validation = validation;
        await setting.save();
      }

      return setting;
    } catch (error) {
      console.error('Error setting value:', error);
      throw error;
    }
  };

  Settings.getByCategory = async function(category) {
    try {
      const settings = await this.findAll({
        where: { category },
        order: [['key', 'ASC']],
      });
      
      const result = {};
      settings.forEach(setting => {
        result[setting.key] = setting.getValue();
      });
      
      return result;
    } catch (error) {
      console.error('Error getting settings by category:', error);
      return {};
    }
  };

  Settings.getAll = async function() {
    try {
      const settings = await this.findAll({
        order: [['category', 'ASC'], ['key', 'ASC']],
      });
      
      const result = {};
      settings.forEach(setting => {
        if (!result[setting.category]) {
          result[setting.category] = {};
        }
        result[setting.category][setting.key] = setting.getValue();
      });
      
      return result;
    } catch (error) {
      console.error('Error getting all settings:', error);
      return {};
    }
  };

  Settings.getPublic = async function() {
    try {
      const settings = await this.scope('public').findAll({
        order: [['category', 'ASC'], ['key', 'ASC']],
      });
      
      const result = {};
      settings.forEach(setting => {
        if (!result[setting.category]) {
          result[setting.category] = {};
        }
        result[setting.category][setting.key] = setting.getValue();
      });
      
      return result;
    } catch (error) {
      console.error('Error getting public settings:', error);
      return {};
    }
  };

  Settings.bulkSet = async function(settingsData) {
    try {
      const results = [];
      
      for (const [key, value] of Object.entries(settingsData)) {
        const result = await this.set(key, value);
        results.push(result);
      }
      
      return results;
    } catch (error) {
      console.error('Error bulk setting values:', error);
      throw error;
    }
  };

  Settings.delete = async function(key) {
    try {
      const setting = await this.findOne({ where: { key } });
      if (setting) {
        await setting.destroy();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting setting:', error);
      throw error;
    }
  };

  return Settings;
};
