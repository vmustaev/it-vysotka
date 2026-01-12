const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Team = sequelize.define('Team', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            is: /^[a-zA-Zа-яА-ЯёЁ0-9\s]+$/i, // только кириллица, латиница и цифры
            len: [3, 50]
        }
    },
    inviteToken: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {
    tableName: 'teams',
    timestamps: true
});

module.exports = Team;
