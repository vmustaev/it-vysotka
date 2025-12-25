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
    last_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    second_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    birthday: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    region: {
        type: DataTypes.STRING,
        allowNull: false
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false
    },
    school: {
        type: DataTypes.STRING,
        allowNull: false
    },
    programming_language: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    format: {
        type: DataTypes.STRING,
        allowNull: false
    },
    grade: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {timestamps: false});

module.exports = UserSchema;