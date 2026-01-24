require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const router = require('./router/index');
const sequelize = require('./db');
const errorMiddleware = require('./middlewares/error-middleware');
const path = require('path');

// Импорт моделей
const UserModel = require('./models/user-model');
const TokenModel = require('./models/token-model');
const SchoolModel = require('./models/school-model');
const TeamModel = require('./models/team-model');
const RoomModel = require('./models/room-model');
const SeatingAssignmentModel = require('./models/seating-assignment-model');
const SettingsModel = require('./models/settings-model');

// Настройка связей между моделями
TeamModel.hasMany(UserModel, { foreignKey: 'teamId', as: 'Members' });
UserModel.belongsTo(TeamModel, { foreignKey: 'teamId', as: 'Team' });

// Связи для рассадки
SeatingAssignmentModel.belongsTo(RoomModel, { foreignKey: 'roomId', as: 'Room', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
SeatingAssignmentModel.belongsTo(TeamModel, { foreignKey: 'teamId', as: 'Team', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
SeatingAssignmentModel.belongsTo(UserModel, { foreignKey: 'userId', as: 'User', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
RoomModel.hasMany(SeatingAssignmentModel, { foreignKey: 'roomId', as: 'Assignments' });
TeamModel.hasOne(SeatingAssignmentModel, { foreignKey: 'teamId', as: 'SeatingAssignment' });
UserModel.hasOne(SeatingAssignmentModel, { foreignKey: 'userId', as: 'SeatingAssignment' });

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use('/files', express.static(path.join(__dirname, 'files')));
app.use('/api', router);
app.use(errorMiddleware);

async function ensureAdminExists() {
    try {
        const bcrypt = require('bcrypt');
        
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@it-vysotka.ru';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        
        const adminExists = await UserModel.findOne({
            where: { role: 'admin' }
        });
        
        if (adminExists) {
            console.log('✅ Администратор уже существует');
            return;
        }
        
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

const start = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');
        await sequelize.sync({ force: false });
        
        const importSchools = require('./scripts/import-schools');
        try {
            await importSchools();
        } catch (importError) {
            console.error('Error importing schools:', importError);
        }
        
        await ensureAdminExists();
        
        app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
    } catch (e) {
        console.log(e);
    }
};

start();