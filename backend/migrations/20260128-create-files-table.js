const { DataTypes } = require('sequelize');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('files', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            filename: {
                type: DataTypes.STRING,
                allowNull: false,
                comment: 'Оригинальное имя файла'
            },
            savedFilename: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                comment: 'Имя файла в файловой системе (уникальное)'
            },
            filepath: {
                type: DataTypes.STRING,
                allowNull: false,
                comment: 'Путь к файлу относительно папки files'
            },
            fileType: {
                type: DataTypes.ENUM(
                    'gallery',
                    'sponsors',
                    'certificates',
                    'tasks',
                    'regulations',
                    'results',
                    'other'
                ),
                allowNull: false,
                comment: 'Тип файла/категория'
            },
            mimetype: {
                type: DataTypes.STRING,
                allowNull: false,
                comment: 'MIME тип файла'
            },
            size: {
                type: DataTypes.INTEGER,
                allowNull: false,
                comment: 'Размер файла в байтах'
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
                comment: 'Описание файла'
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                comment: 'Активен ли файл'
            },
            uploadedBy: {
                type: DataTypes.INTEGER,
                allowNull: true,
                comment: 'ID пользователя, загрузившего файл',
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Добавляем индексы для быстрого поиска
        await queryInterface.addIndex('files', ['fileType']);
        await queryInterface.addIndex('files', ['isActive']);
        await queryInterface.addIndex('files', ['uploadedBy']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('files');
    }
};
