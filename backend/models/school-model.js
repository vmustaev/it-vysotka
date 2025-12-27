const {DataTypes} = require('sequelize');
const sequelize = require('../db');

const SchoolSchema = sequelize.define('School', {
    region: {
        type: DataTypes.STRING,
        allowNull: false
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    timestamps: false,
    tableName: 'schools'
});

module.exports = SchoolSchema;

