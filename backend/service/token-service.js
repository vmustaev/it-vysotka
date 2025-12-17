const jwt = require('jsonwebtoken');
const tokenModel = require('../models/token-model');

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
                payload.type = 'reset';
                break;
            default:
                throw new Error('Неизвестный тип токена');
        }
        
        return jwt.sign(payload, secret, { expiresIn });
    }

    validateToken(token, type) {
        try {
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
                default:
                    throw new Error('Неизвестный тип токена');
            }
            
            const userData = jwt.verify(token, secret);
            
            if (type === 'reset' && userData.type !== 'reset') {
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
}

module.exports = new TokenService();