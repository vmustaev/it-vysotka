const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const AttendanceHistorySchema = sequelize.define('AttendanceHistory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    markedBy: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    attendance: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
}, {
    tableName: 'attendance_history',
    timestamps: true,
    updatedAt: false // Нам нужен только createdAt
});

module.exports = AttendanceHistorySchema;

