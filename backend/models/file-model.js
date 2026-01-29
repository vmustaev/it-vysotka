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
        allowNull: false
    },
    savedFilename: {
        type: DataTypes.STRING,
        allowNull: false
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
        allowNull: false
    },
    mimetype: {
        type: DataTypes.STRING,
        allowNull: false
    },
    size: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    uploadedBy: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    displayOrder: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    subType: {
        type: DataTypes.STRING,
        allowNull: true
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'files',
    timestamps: true
});

module.exports = File;
