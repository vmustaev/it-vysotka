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
// CertificateModel удален - настройки сертификатов теперь в settings
const FileModel = require('./models/file-model');
const ChampionshipResultModel = require('./models/championship-result-model');

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

// Связи для файлов
FileModel.belongsTo(UserModel, { foreignKey: 'uploadedBy', as: 'Uploader' });
UserModel.hasMany(FileModel, { foreignKey: 'uploadedBy', as: 'UploadedFiles' });

// Связь User -> Certificate File
UserModel.belongsTo(FileModel, { foreignKey: 'certificateId', as: 'Certificate' });

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cookieParser());

// CORS configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || '*',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

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
        
    } catch (error) {
        console.error('❌ Ошибка при создании администратора:', error);
    }
}

const start = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');
        await sequelize.sync({ alter: false });
        
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