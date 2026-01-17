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
    timestamps: true,
    hooks: {
        beforeDestroy: async (team, options) => {
            const UserModel = require('./user-model');
            await UserModel.update(
                { teamId: null, isLead: false },
                { 
                    where: { teamId: team.id },
                    transaction: options.transaction 
                }
            );
        }
    }
});

module.exports = Team;
