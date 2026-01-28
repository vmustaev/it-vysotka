require('dotenv').config();
const sequelize = require('../db');
const path = require('path');

async function migrateFilesTable() {
    try {
        console.log('🚀 Создание таблицы files...\n');
        
        await sequelize.authenticate();
        console.log('✅ Подключение к базе данных установлено\n');

        const migration = require('../migrations/20260128-create-files-table.js');
        
        console.log('⏳ Создание таблицы files...');
        try {
            await migration.up(sequelize.getQueryInterface(), sequelize);
            console.log('✅ Таблица files успешно создана!\n');
        } catch (error) {
            if (error.message && error.message.includes('already exists')) {
                console.log('ℹ️  Таблица files уже существует\n');
            } else {
                throw error;
            }
        }

        console.log('🎉 Миграция завершена успешно!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Ошибка при миграции:', error.message);
        process.exit(1);
    }
}

migrateFilesTable();
