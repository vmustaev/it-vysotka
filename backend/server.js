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
        
        app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
    } catch (e) {
        console.log(e);
    }
}

start()