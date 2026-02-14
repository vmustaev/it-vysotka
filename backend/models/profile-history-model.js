const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const ProfileHistorySchema = sequelize.define('ProfileHistory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    editedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    changes: {
        type: DataTypes.JSONB,
        allowNull: false,
        comment: 'JSON объект с изменениями: { field: { old: "oldValue", new: "newValue" } }'
    }
}, {
    tableName: 'profile_history',
    timestamps: true,
    updatedAt: false // Нам нужен только createdAt
});

// Связи будут установлены в server.js или отдельном файле инициализации
module.exports = ProfileHistorySchema;

