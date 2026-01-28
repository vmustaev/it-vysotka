'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('certificates', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            templatePath: {
                type: Sequelize.STRING,
                allowNull: false,
                field: 'template_path'
            },
            textX: {
                type: Sequelize.FLOAT,
                allowNull: false,
                defaultValue: 0,
                field: 'text_x'
            },
            textY: {
                type: Sequelize.FLOAT,
                allowNull: false,
                defaultValue: 0,
                field: 'text_y'
            },
            fontSize: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 110,
                field: 'font_size'
            },
            fontColor: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: '#023664',
                field: 'font_color'
            },
            fontPath: {
                type: Sequelize.STRING,
                allowNull: true,
                field: 'font_path'
            },
            isActive: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                field: 'is_active'
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                field: 'created_at'
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                field: 'updated_at'
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('certificates');
    }
};

