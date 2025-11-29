const {DataTypes} = require('sequelize');
const sequelize = require('../db');

const UserSchema = sequelize.define('User', {
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isActivated: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    activationLink: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {timestamps: false});

module.exports = UserSchema;