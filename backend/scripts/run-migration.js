require('dotenv').config();
const sequelize = require('../db');
const path = require('path');
const fs = require('fs');

async function runMigrations() {
    try {
        console.log('🚀 Запуск миграций...\n');
        
        await sequelize.authenticate();
        console.log('✅ Подключение к базе данных установлено');

        const migrationsDir = path.join(__dirname, '../migrations');
        const migrationFiles = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.js'))
            .sort();

        console.log(`📁 Найдено миграций: ${migrationFiles.length}\n`);

        for (const file of migrationFiles) {
            console.log(`⏳ Выполнение миграции: ${file}`);
            const migration = require(path.join(migrationsDir, file));
            
            try {
                await migration.up(sequelize.getQueryInterface(), sequelize);
                console.log(`✅ Миграция ${file} выполнена успешно\n`);
            } catch (error) {
                if (error.message.includes('already exists')) {
                    console.log(`ℹ️  Миграция ${file} уже применена\n`);
                } else {
                    throw error;
                }
            }
        }

        console.log('🎉 Все миграции выполнены успешно!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Ошибка при выполнении миграций:', error);
        process.exit(1);
    }
}

runMigrations();
