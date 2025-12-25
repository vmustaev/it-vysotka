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
    token: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: true,
    indexes: [
        {
            fields: ['token', 'type']
        },
        {
            fields: ['userId', 'type']
        },
        {
            fields: ['createdAt']
        }
    ]
});

module.exports = TokenSchema;