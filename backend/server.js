require('dotenv').config()
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const cookieParser = require('cookie-parser')
const router = require('./router/index')
const sequelize = require('./db');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use('/api',router);



const start = async() => {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');
        
        //await sequelize.sync({ force: false }); 
        
        app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
    } catch (e) {
        console.log(e);
    }
}

start()