require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const sequelize = require('../db');
const School = require('../models/school-model');

const CSV_FILE_PATH = path.join(__dirname, '../educational_orgs_russia.csv');

async function importSchools() {
    try {
        // Подключаемся к БД (если еще не подключены)
        await sequelize.authenticate();
        
        // Синхронизируем модель (создаем таблицу если её нет)
        await sequelize.sync({ force: false });
        
        // Проверяем, есть ли уже школы в базе
        const schoolCount = await School.count();
        if (schoolCount > 0) {
            console.log(`Schools already exist in database (${schoolCount} schools). Skipping import.`);
            return;
        }

        console.log('Schools table is empty. Starting import...');

        const schools = [];
        let rowCount = 0;

        console.log('Reading CSV file...');

        return new Promise((resolve, reject) => {
            fs.createReadStream(CSV_FILE_PATH)
                .pipe(csv({
                    headers: ['ИНН', 'Регион', 'Населенный_пункт', 'Название'],
                    skipEmptyLines: true
                }))
                .on('data', (row) => {
                    // Пропускаем пустые строки и строку с заголовками
                    if (row['Регион'] && row['Населенный_пункт'] && row['Название'] &&
                        row['Регион'] !== 'Регион' && row['Населенный_пункт'] !== 'Населенный_пункт' && row['Название'] !== 'Название') {
                        schools.push({
                            region: row['Регион'].trim(),
                            city: row['Населенный_пункт'].trim(),
                            name: row['Название'].trim()
                        });
                        rowCount++;
                    }
                })
                .on('end', async () => {
                    try {
                        console.log(`Parsed ${rowCount} rows from CSV`);
                        console.log('Importing to database...');

                        // Импортируем все школы
                        const result = await School.bulkCreate(schools, {
                            returning: true
                        });

                        console.log(`Successfully imported ${result.length} schools to database`);
                        console.log('Import completed!');
                        
                        resolve();
                    } catch (error) {
                        console.error('Error importing schools:', error);
                        reject(error);
                    }
                })
                .on('error', (error) => {
                    console.error('Error reading CSV file:', error);
                    reject(error);
                });
        });
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Если скрипт запущен напрямую (не как модуль)
if (require.main === module) {
    importSchools()
        .then(() => {
            console.log('Script finished successfully');
            sequelize.close().then(() => process.exit(0));
        })
        .catch((error) => {
            console.error('Script failed:', error);
            sequelize.close().then(() => process.exit(1));
        });
}

// Экспортируем функцию для использования в других модулях
module.exports = importSchools;


