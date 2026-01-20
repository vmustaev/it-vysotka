const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const RoomSchema = sequelize.define('Room', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: {
                msg: 'Номер аудитории обязателен'
            }
        }
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: {
                args: [1],
                msg: 'Количество мест должно быть не менее 1'
            },
            isInt: {
                msg: 'Количество мест должно быть целым числом'
            }
        }
    }
}, {
    tableName: 'rooms',
    timestamps: true
});

module.exports = RoomSchema;
