const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/database.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Load models manually with error handling
const modelFiles = fs.readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && 
           (file !== basename) && 
           (file.slice(-3) === '.js');
  });

modelFiles.forEach(file => {
  try {
    const model = require(path.join(__dirname, file));
    const modelInstance = typeof model === 'function' 
      ? model(sequelize, Sequelize.DataTypes) 
      : model;
    
    if (modelInstance && modelInstance.name) {
      console.log(`Successfully loaded model: ${modelInstance.name}`);
      db[modelInstance.name] = modelInstance;
    } else {
      console.warn(`Warning: Model in file ${file} did not initialize correctly`);
    }
  } catch (error) {
    console.error(`Error loading model ${file}:`, error.message);
  }
});

// Set up model associations with null checks
Object.keys(db).forEach(modelName => {
  if (db[modelName] && typeof db[modelName].associate === 'function') {
    try {
      db[modelName].associate(db);
    } catch (error) {
      console.error(`Error setting up associations for ${modelName}:`, error.message);
    }
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
