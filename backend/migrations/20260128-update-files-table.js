const { DataTypes } = require('sequelize');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Добавляем новые колонки
        await queryInterface.addColumn('files', 'displayOrder', {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            comment: 'Порядок отображения (для спонсоров)'
        });

        await queryInterface.addColumn('files', 'subType', {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Подтип файла (например: consent_minor, consent_adult для regulations)'
        });

        await queryInterface.addColumn('files', 'year', {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Год (для заданий)'
        });

        // Добавляем индексы
        await queryInterface.addIndex('files', ['displayOrder']);
        await queryInterface.addIndex('files', ['year']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('files', 'displayOrder');
        await queryInterface.removeColumn('files', 'subType');
        await queryInterface.removeColumn('files', 'year');
    }
};
