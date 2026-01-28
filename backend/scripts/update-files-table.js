require('dotenv').config();
const sequelize = require('../db');

async function updateFilesTable() {
    try {
        console.log('🚀 Обновление таблицы files...\n');
        
        await sequelize.authenticate();
        console.log('✅ Подключение к базе данных установлено\n');

        const migration = require('../migrations/20260128-update-files-table.js');
        
        console.log('⏳ Добавление новых полей в таблицу files...');
        try {
            await migration.up(sequelize.getQueryInterface(), sequelize);
            console.log('✅ Таблица files успешно обновлена!\n');
        } catch (error) {
            if (error.message && error.message.includes('already exists')) {
                console.log('ℹ️  Поля уже существуют\n');
            } else {
                throw error;
            }
        }

        console.log('🎉 Обновление завершено успешно!');
        console.log('\n📝 Добавлены поля:');
        console.log('   - displayOrder (порядок отображения для спонсоров)');
        console.log('   - subType (подтип для документов)');
        console.log('   - year (год для заданий)');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Ошибка при обновлении:', error.message);
        process.exit(1);
    }
}

updateFilesTable();
