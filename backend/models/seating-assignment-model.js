const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const SeatingAssignmentSchema = sequelize.define('SeatingAssignment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    teamId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    roomId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'seating_assignments',
    timestamps: true
});

module.exports = SeatingAssignmentSchema;
