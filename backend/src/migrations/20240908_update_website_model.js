'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Add new columns
      await queryInterface.addColumn('Websites', 'slug', {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        defaultValue: Sequelize.literal("lower(replace(name, ' ', '-'))")
      }, { transaction });

      await queryInterface.addColumn('Websites', 'categoryId', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      }, { transaction });

      // Update existing data to have valid categoryId
      // This assumes you have at least one category in your database
      const [categories] = await queryInterface.sequelize.query(
        'SELECT id FROM "Categories" LIMIT 1',
        { transaction }
      );
      
      if (categories.length > 0) {
        await queryInterface.sequelize.query(
          `UPDATE "Websites" SET "categoryId" = '${categories[0].id}' WHERE "categoryId" IS NULL`,
          { transaction }
        );
      }

      // Make categoryId non-nullable after setting default values
      await queryInterface.changeColumn('Websites', 'categoryId', {
        type: Sequelize.UUID,
        allowNull: false
      }, { transaction });

      // Add indexes
      await queryInterface.addIndex('Websites', ['slug'], {
        unique: true,
        transaction
      });

      await queryInterface.addIndex('Websites', ['categoryId'], {
        transaction
      });

      await queryInterface.addIndex('Websites', ['tier'], {
        transaction
      });

      await queryInterface.addIndex('Websites', ['status'], {
        transaction
      });

      await queryInterface.addIndex('Websites', ['isFeatured'], {
        transaction
      });

      // Remove the old category column after migrating data
      await queryInterface.removeColumn('Websites', 'category', { transaction });

      // Change JSON to JSONB for metadata
      await queryInterface.sequelize.query(
        'ALTER TABLE "Websites" ALTER COLUMN "metadata" TYPE JSONB USING "metadata"::jsonb',
        { transaction }
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Revert changes
      await queryInterface.addColumn('Websites', 'category', {
        type: Sequelize.STRING,
        allowNull: true
      }, { transaction });

      // Copy data back from categoryId to category if needed
      // Note: This is a simplified example - you might need to adjust based on your Category model
      await queryInterface.sequelize.query(
        `UPDATE "Websites" SET category = (
          SELECT name FROM "Categories" WHERE "Categories".id = "Websites"."categoryId"
        )`,
        { transaction }
      );

      // Remove indexes
      await queryInterface.removeIndex('Websites', ['slug'], { transaction });
      await queryInterface.removeIndex('Websites', ['categoryId'], { transaction });
      await queryInterface.removeIndex('Websites', ['tier'], { transaction });
      await queryInterface.removeIndex('Websites', ['status'], { transaction });
      await queryInterface.removeIndex('Websites', ['isFeatured'], { transaction });

      // Remove new columns
      await queryInterface.removeColumn('Websites', 'slug', { transaction });
      await queryInterface.removeColumn('Websites', 'categoryId', { transaction });

      // Revert JSONB to JSON
      await queryInterface.sequelize.query(
        'ALTER TABLE "Websites" ALTER COLUMN "metadata" TYPE JSON USING "metadata"::json',
        { transaction }
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
