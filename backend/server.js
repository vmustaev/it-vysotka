require('dotenv').config()
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const router = require('./router/index')
const sequelize = require('./db');
const errorMiddleware = require('./middlewares/error-middleware')
const path = require('path');

// Импортируем модели для автоматического создания таблиц
const UserModel = require('./models/user-model');
const TokenModel = require('./models/token-model');
const SchoolModel = require('./models/school-model');
const TeamModel = require('./models/team-model');

// Настройка связей между моделями
// Команда имеет много участников (через teamId в User)
TeamModel.hasMany(UserModel, { foreignKey: 'teamId', as: 'Members' });
UserModel.belongsTo(TeamModel, { foreignKey: 'teamId', as: 'Team' });

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cookieParser());
app.use(cors());
// Раздача статических файлов из папки uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api',router);
app.use(errorMiddleware);

// Функция автоматического создания администратора
async function ensureAdminExists() {
    try {
        const bcrypt = require('bcrypt');
        
        // Берем данные из переменных окружения
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@it-vysotka.ru';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        
        // Проверяем, есть ли уже пользователь с ролью admin
        const adminExists = await UserModel.findOne({
            where: { role: 'admin' }
        });
        
        if (adminExists) {
            console.log('✅ Администратор уже существует');
            return;
        }
        
        // Создаем админа
        const hashedPassword = await bcrypt.hash(adminPassword, 3);
        
        await UserModel.create({
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
            isActivated: true,
            last_name: 'Администратор',
            first_name: 'Системный',
            second_name: null,
            birthday: '1990-01-01',
            region: 'Республика Бурятия',
            city: 'Улан-Удэ',
            school: 'Администрация',
            programming_language: 'Не указано',
            phone: '+70000000000',
            grade: 11,
            participation_format: 'individual'
        });
        
        console.log('\n========================================');
        console.log('✅ АДМИНИСТРАТОР УСПЕШНО СОЗДАН!');
        console.log(`📧 Email: ${adminEmail}`);
        console.log(`🔑 Пароль: ${adminPassword}`);
        console.log('⚠️  ОБЯЗАТЕЛЬНО смените пароль после первого входа!');
        console.log('========================================\n');
        
    } catch (error) {
        console.error('❌ Ошибка при создании администратора:', error);
    }
}

const start = async() => {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');
        await sequelize.sync({ force: false });
        
        // Автоматически импортируем школы, если таблица пустая
        const importSchools = require('./scripts/import-schools');
        try {
            await importSchools();
        } catch (importError) {
            console.error('Error importing schools:', importError);
            // Не прерываем запуск сервера, если импорт не удался
        }
        
        // Автоматически создаем администратора, если его нет
        await ensureAdminExists();
        
        app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
    } catch (e) {
        console.log(e);
    }
}

start()