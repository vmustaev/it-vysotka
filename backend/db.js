const { Sequelize } = require('sequelize');

module.exports = new Sequelize(
    process.env.DB_NAME || 'my_db',
    process.env.DB_USER || 'admin',
    process.env.DB_PASSWORD || 'root',
    {
        host: process.env.DB_HOST || 'db',
        dialect: 'postgres',
        port: process.env.DB_PORT || 5432
    }
);