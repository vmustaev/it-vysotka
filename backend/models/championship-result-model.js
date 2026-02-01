const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const ChampionshipResultSchema = sequelize.define('ChampionshipResult', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: {
                args: [2000],
                msg: 'Год должен быть не менее 2000'
            },
            max: {
                args: [2100],
                msg: 'Год должен быть не более 2100'
            }
        }
    },
    place: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: {
                args: [1],
                msg: 'Место должно быть не менее 1'
            }
        }
    },
    participants: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Список участников через запятую'
    },
    schools: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Список учебных заведений через запятую'
    },
    cities: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Список городов через запятую'
    }
}, {
    tableName: 'championship_results',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['year', 'place'],
            name: 'unique_year_place'
        }
    ]
});

module.exports = ChampionshipResultSchema;

