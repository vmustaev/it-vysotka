const {DataTypes} = require('sequelize');
const sequelize = require('../db');

const TokenSchema = sequelize.define('Token', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    refreshToken: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {timestamps: false});

module.exports = TokenSchema;