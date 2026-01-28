const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const File = sequelize.define('File', {
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
            'gallery',        // Галерея
            'sponsors',       // Спонсоры
            'certificates',   // Сертификаты
            'tasks',          // Задания
            'regulations',    // Положения/регламенты
            'results',        // Результаты
            'other'           // Другое
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
        comment: 'ID пользователя, загрузившего файл'
    },
    displayOrder: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Порядок отображения (для спонсоров)'
    },
    subType: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Подтип файла (например: consent_minor, consent_adult для regulations)'
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Год (для заданий)'
    }
}, {
    tableName: 'files',
    timestamps: true
});

module.exports = File;
