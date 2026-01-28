const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Certificate = sequelize.define('Certificate', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    templatePath: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Путь к файлу шаблона сертификата'
    },
    textX: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
        comment: 'X координата текста ФИО'
    },
    textY: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
        comment: 'Y координата текста ФИО'
    },
    fontSize: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 110,
        comment: 'Размер шрифта'
    },
    fontColor: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '#023664',
        comment: 'Цвет шрифта'
    },
    fontPath: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Путь к файлу шрифта (Code Pro Regular)'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Активный шаблон'
    }
}, {
    tableName: 'certificates',
    timestamps: true
});

module.exports = Certificate;

