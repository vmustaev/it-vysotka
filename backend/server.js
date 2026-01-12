require('dotenv').config()
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const router = require('./router/index')
const sequelize = require('./db');
const errorMiddleware = require('./middlewares/error-middleware')
const path = require('path');

// Импортируем модели для автоматического создания таблиц
require('./models/user-model');
require('./models/token-model');
require('./models/school-model');

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
        app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
    } catch (e) {
        console.log(e);
    }
}

start()