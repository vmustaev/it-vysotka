const jwt = require('jsonwebtoken');
const tokenModel = require('../models/token-model');
const uuid = require('uuid');

class TokenService {
    generateToken(payload, type, expiresIn) {
        let secret;
        
        switch(type) {
            case 'access':
                secret = process.env.JWT_ACCESS_SECRET;
                expiresIn = expiresIn || '15m';
                break;
            case 'refresh':
                secret = process.env.JWT_REFRESH_SECRET;
                expiresIn = expiresIn || '30d';
                break;
            case 'reset':
                secret = process.env.JWT_RESET_SECRET;
                expiresIn = expiresIn || '15m';
                break;
            case 'activation':
                secret = process.env.JWT_ACTIVATION_SECRET || process.env.JWT_ACCESS_SECRET;
                expiresIn = expiresIn || '7d';
                break;
            default:
                throw new Error('Неизвестный тип токена');
        }
        
        if (!secret) {
            throw new Error(`Секрет для токена типа '${type}' не настроен. Проверьте переменные окружения.`);
        }
        
        // Создаем копию payload, чтобы не мутировать исходный объект
        const tokenPayload = { ...payload };
        if (type === 'reset') {
            tokenPayload.type = 'reset';
        }
        if (type === 'activation') {
            tokenPayload.type = 'activation';
        }
        
        return jwt.sign(tokenPayload, secret, { expiresIn });
    }

    validateToken(token, type) {
        try {
            if (!token) {
                return null;
            }
            
            let secret;
            
            switch(type) {
                case 'access':
                    secret = process.env.JWT_ACCESS_SECRET;
                    break;
                case 'refresh':
                    secret = process.env.JWT_REFRESH_SECRET;
                    break;
                case 'reset':
                    secret = process.env.JWT_RESET_SECRET;
                    break;
                case 'activation':
                    secret = process.env.JWT_ACTIVATION_SECRET || process.env.JWT_ACCESS_SECRET;
                    break;
                default:
                    throw new Error('Неизвестный тип токена');
            }
            
            if (!secret) {
                throw new Error(`Секрет для токена типа '${type}' не настроен. Проверьте переменные окружения.`);
            }
            
            const userData = jwt.verify(token, secret);
            
            if (type === 'reset' && userData.type !== 'reset') {
                return null;
            }
            
            if (type === 'activation' && userData.type !== 'activation') {
                return null;
            }
            
            return userData;
        } catch(e) {
            return null;
        }
    }

    async saveToken(userId, token, type) {
        if (type === 'refresh') {
            const tokenData = await tokenModel.findOne({ 
                where: { 
                    userId,
                    type: 'refresh'
                } 
            });
            
            if (tokenData) {
                tokenData.token = token;
                return tokenData.save();
            }
        }
        
        const newToken = await tokenModel.create({ 
            userId, 
            token,
            type
        });
        return newToken;
    }
    
    async removeToken(token, type) {
        const tokenData = await tokenModel.destroy({ 
            where: { 
                token,
                type 
            } 
        });
        return tokenData;
    }

    async findToken(token, type) {
        const tokenData = await tokenModel.findOne({ 
            where: { 
                token,
                type 
            } 
        });
        return tokenData;
    }

    async removeAllUserTokens(userId, type) {
        const deletedCount = await tokenModel.destroy({ 
            where: { 
                userId,
                type 
            } 
        });
        return deletedCount;
    }

    // Генерация UUID-based токена (для activation и reset)
    async generateUuidToken(userId, type) {
        const uuidToken = uuid.v4();
        
        await tokenModel.create({ 
            userId, 
            token: uuidToken,
            type
        });
        
        return uuidToken;
    }

    // Валидация UUID токена с проверкой времени жизни
    async validateUuidToken(uuidToken, type, ttlMinutes) {
        const tokenData = await tokenModel.findOne({ 
            where: { 
                token: uuidToken,
                type 
            } 
        });
        
        if (!tokenData) {
            return null;
        }
        
        // Проверяем время жизни токена
        const now = new Date();
        const tokenAge = now - new Date(tokenData.createdAt);
        const maxAge = ttlMinutes * 60 * 1000; // Конвертируем минуты в миллисекунды
        
        if (tokenAge > maxAge) {
            // Токен истек, удаляем его
            await this.removeToken(uuidToken, type);
            return null;
        }
        
        return tokenData;
    }

    // Проверка наличия активных токенов у пользователя (для проверки активной сессии)
    async hasUserTokens(userId, type) {
        const count = await tokenModel.count({ 
            where: { 
                userId,
                type 
            } 
        });
        return count > 0;
    }
}

module.exports = new TokenService();