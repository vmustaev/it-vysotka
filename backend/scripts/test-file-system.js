require('dotenv').config();
const sequelize = require('../db');
const FileModel = require('../models/file-model');
const fs = require('fs');
const path = require('path');

/**
 * Тестовый скрипт для проверки файловой системы
 * Запуск: node scripts/test-file-system.js
 */

async function testFileSystem() {
    console.log('🧪 Тестирование файловой системы...\n');

    try {
        // 1. Проверка подключения к БД
        console.log('1️⃣  Проверка подключения к БД...');
        await sequelize.authenticate();
        console.log('✅ Подключение к БД установлено\n');

        // 2. Проверка существования таблицы files
        console.log('2️⃣  Проверка таблицы files...');
        const tableExists = await sequelize.getQueryInterface().showAllTables();
        if (tableExists.includes('files')) {
            console.log('✅ Таблица files существует\n');
        } else {
            console.log('❌ Таблица files не найдена! Запустите миграцию: npm run migrate\n');
            process.exit(1);
        }

        // 3. Проверка модели File
        console.log('3️⃣  Проверка модели File...');
        const fileCount = await FileModel.count();
        console.log(`✅ Модель File работает. Файлов в БД: ${fileCount}\n`);

        // 4. Проверка папки files
        console.log('4️⃣  Проверка папки files...');
        const filesDir = path.join(__dirname, '../files');
        if (fs.existsSync(filesDir)) {
            const files = fs.readdirSync(filesDir);
            console.log(`✅ Папка files существует. Файлов в папке: ${files.length}\n`);
        } else {
            console.log('⚠️  Папка files не найдена. Создаем...');
            fs.mkdirSync(filesDir, { recursive: true });
            console.log('✅ Папка files создана\n');
        }

        // 5. Проверка типов файлов
        console.log('5️⃣  Проверка типов файлов...');
        const fileTypes = ['gallery', 'sponsors', 'certificates', 'tasks', 'regulations', 'results', 'other'];
        console.log('✅ Доступные типы файлов:', fileTypes.join(', '));
        console.log('');

        // 6. Статистика по типам
        console.log('6️⃣  Статистика по типам файлов:');
        for (const type of fileTypes) {
            const count = await FileModel.count({ where: { fileType: type } });
            if (count > 0) {
                console.log(`   📁 ${type}: ${count} файлов`);
            }
        }
        console.log('');

        // 7. Последние загруженные файлы
        console.log('7️⃣  Последние 5 загруженных файлов:');
        const recentFiles = await FileModel.findAll({
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        if (recentFiles.length > 0) {
            recentFiles.forEach(file => {
                console.log(`   📄 ${file.filename} (${file.fileType}) - ${new Date(file.createdAt).toLocaleString('ru-RU')}`);
            });
        } else {
            console.log('   ℹ️  Нет загруженных файлов');
        }
        console.log('');

        // 8. Проверка активных файлов
        console.log('8️⃣  Проверка активных файлов...');
        const activeCount = await FileModel.count({ where: { isActive: true } });
        const inactiveCount = await FileModel.count({ where: { isActive: false } });
        console.log(`   ✅ Активных: ${activeCount}`);
        console.log(`   ⏸️  Неактивных: ${inactiveCount}`);
        console.log('');

        // Итог
        console.log('═══════════════════════════════════════');
        console.log('🎉 Все проверки пройдены успешно!');
        console.log('═══════════════════════════════════════\n');

        console.log('📋 API Endpoints:');
        console.log('   POST   /api/admin/files/upload');
        console.log('   GET    /api/admin/files');
        console.log('   GET    /api/admin/files/stats');
        console.log('   GET    /api/admin/files/:id');
        console.log('   PUT    /api/admin/files/:id');
        console.log('   DELETE /api/admin/files/:id');
        console.log('   GET    /api/files/type/:type');
        console.log('   GET    /files/:filename');
        console.log('');

        console.log('💡 Следующие шаги:');
        console.log('   1. Запустите backend сервер');
        console.log('   2. Откройте админ-панель');
        console.log('   3. Загрузите первые файлы');
        console.log('   4. Проверьте отображение на фронтенде');
        console.log('');

        process.exit(0);

    } catch (error) {
        console.error('❌ Ошибка при тестировании:', error.message);
        console.error(error);
        process.exit(1);
    }
}

testFileSystem();
