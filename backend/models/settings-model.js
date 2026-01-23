const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const SettingsSchema = sequelize.define('Settings', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    value: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'settings',
    timestamps: true
});

module.exports = SettingsSchema;

