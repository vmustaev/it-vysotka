const jwt = require('jsonwebtoken');
const tokenModel = require('../models/token-model');

class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn:'20s'})
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn:'30d'})
        return {
            accessToken,
            refreshToken
        }
    }

    validateAccessToken(accessToken){
        try{
            const userData = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
            return userData;
        } catch(e){
            return null;
        }
    }

    validateRefreshToken(refreshToken){
        try{
            const userData = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            return userData;
        } catch(e){
            return null;
        }
    }


    async saveToken(userId, refreshToken) {
        const tokenData = await tokenModel.findOne({ where: { userId } })
        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            return tokenData.save();
        }

        const token = await tokenModel.create({ userId, refreshToken })
        return token;
    }
    
    async removeToken(refreshToken){
        const tokenData = await tokenModel.destroy({where : {refreshToken}});
        return tokenData;
    }

    async findToken(refreshToken){
        const tokenData = await tokenModel.findOne({where : {refreshToken}});
        return tokenData;
    }
}

module.exports = new TokenService();