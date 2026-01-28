require('dotenv').config();
const sequelize = require('../db');
const FileModel = require('../models/file-model');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Скрипт для импорта существующих файлов в базу данных
 * Автоматически определяет тип файла по имени и создает записи в БД
 */

// Правила для определения типа файла
const fileTypeRules = {
    sponsors: [
        'burintech.jpg',
        'kuraisoft.jpg', 
        'petrotest.png',
        'redsoft.png',
        'роснефть.jpg',
        'транснефть.png',
        'банер гк бит пнг.png'
    ],
    tasks: [
        /^task\d+.*\.pdf$/i,  // task1.pdf, task2_2025.pdf и т.д.
    ],
    regulations: [
        'polozhenie.pdf',
        'roditeli.pdf',
        'uchastniki.pdf',
        'booklet.docx'
    ],
    gallery: [
        /^DSC_.*\.(jpg|jpeg|png)$/i,   // Фото с камеры DSC
        /^IMG_.*\.(jpg|jpeg|png)$/i,   // Фото с телефона/камеры IMG
        /^ITchamp.*\.(jpg|jpeg|png)$/i // Фото с мероприятия
    ]
};

/**
 * Определяет тип файла по его имени
 */
function determineFileType(filename) {
    const lowerFilename = filename.toLowerCase();

    // Проверяем спонсоров
    if (fileTypeRules.sponsors.some(sponsor => sponsor.toLowerCase() === lowerFilename)) {
        return 'sponsors';
    }

    // Проверяем задания
    if (fileTypeRules.tasks.some(pattern => {
        if (pattern instanceof RegExp) {
            return pattern.test(filename);
        }
        return pattern.toLowerCase() === lowerFilename;
    })) {
        return 'tasks';
    }

    // Проверяем положения/регламенты
    if (fileTypeRules.regulations.some(doc => doc.toLowerCase() === lowerFilename)) {
        return 'regulations';
    }

    // Проверяем галерею
    if (fileTypeRules.gallery.some(pattern => {
        if (pattern instanceof RegExp) {
            return pattern.test(filename);
        }
        return pattern.toLowerCase() === lowerFilename;
    })) {
        return 'gallery';
    }

    // По умолчанию - другое
    return 'other';
}

/**
 * Получает MIME тип файла по расширению
 */
function getMimeType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.txt': 'text/plain'
    };
    return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Генерирует описание для файла
 */
function generateDescription(filename, fileType) {
    if (fileType === 'gallery') {
        return 'Фотография с мероприятия IT-Высотка';
    }
    if (fileType === 'sponsors') {
        return 'Логотип партнера/спонсора';
    }
    if (fileType === 'tasks') {
        return 'Файл с заданиями для участников';
    }
    if (fileType === 'regulations') {
        return 'Документ с положениями/регламентом';
    }
    return null;
}

async function importExistingFiles() {
    console.log('🚀 Импорт существующих файлов в базу данных...\n');

    try {
        // Подключаемся к БД
        await sequelize.authenticate();
        console.log('✅ Подключение к БД установлено\n');

        const filesDir = path.join(__dirname, '../files');
        
        // Получаем список файлов (не включая подпапки)
        const files = fs.readdirSync(filesDir).filter(file => {
            const fullPath = path.join(filesDir, file);
            return fs.statSync(fullPath).isFile();
        });

        console.log(`📁 Найдено файлов: ${files.length}\n`);

        let imported = 0;
        let skipped = 0;
        let errors = 0;

        for (const filename of files) {
            try {
                // Проверяем, существует ли уже запись для этого файла
                const existing = await FileModel.findOne({
                    where: { savedFilename: filename }
                });

                if (existing) {
                    console.log(`⏭️  Пропущен (уже существует): ${filename}`);
                    skipped++;
                    continue;
                }

                // Получаем информацию о файле
                const fullPath = path.join(filesDir, filename);
                const stats = fs.statSync(fullPath);
                const fileType = determineFileType(filename);
                const mimetype = getMimeType(filename);
                const description = generateDescription(filename, fileType);

                // Создаем запись в БД
                await FileModel.create({
                    filename: filename,
                    savedFilename: filename,
                    filepath: filename,
                    fileType: fileType,
                    mimetype: mimetype,
                    size: stats.size,
                    description: description,
                    isActive: true,
                    uploadedBy: null
                });

                console.log(`✅ Импортирован [${fileType}]: ${filename}`);
                imported++;

            } catch (error) {
                console.error(`❌ Ошибка при импорте ${filename}:`, error.message);
                errors++;
            }
        }

        console.log('\n═══════════════════════════════════════');
        console.log('📊 ИТОГИ ИМПОРТА:');
        console.log('═══════════════════════════════════════');
        console.log(`✅ Импортировано: ${imported}`);
        console.log(`⏭️  Пропущено: ${skipped}`);
        console.log(`❌ Ошибок: ${errors}`);
        console.log(`📁 Всего обработано: ${files.length}`);
        console.log('═══════════════════════════════════════\n');

        // Показываем статистику по типам
        console.log('📈 Статистика по типам файлов:');
        const stats = await FileModel.findAll({
            attributes: [
                'fileType',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['fileType']
        });

        const fileTypeNames = {
            gallery: 'Галерея',
            sponsors: 'Спонсоры',
            certificates: 'Сертификаты',
            tasks: 'Задания',
            regulations: 'Положения',
            results: 'Результаты',
            other: 'Другое'
        };

        stats.forEach(stat => {
            const typeName = fileTypeNames[stat.fileType] || stat.fileType;
            console.log(`   ${typeName}: ${stat.dataValues.count} файлов`);
        });

        console.log('\n🎉 Импорт завершен успешно!\n');

        console.log('💡 Следующие шаги:');
        console.log('   1. Проверьте файлы в админ-панели: /admin/files');
        console.log('   2. При необходимости отредактируйте типы или описания');
        console.log('   3. Файлы доступны через API: /api/files/type/{type}');
        console.log('');

        process.exit(0);

    } catch (error) {
        console.error('❌ Критическая ошибка:', error);
        process.exit(1);
    }
}

// Запускаем импорт
importExistingFiles();
