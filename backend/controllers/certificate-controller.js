const certificateService = require('../service/certificate-service');
const ApiError = require('../exceptions/api-error');

class CertificateController {
    
    // Загрузка шаблона сертификата
    async uploadTemplate(req, res, next) {
        try {
            if (!req.file) {
                throw ApiError.BadRequest('Файл не загружен');
            }

            const settings = {
                textX: parseFloat(req.body.textX) || 0,
                textY: parseFloat(req.body.textY) || 0,
                fontSize: parseInt(req.body.fontSize) || 110,
                fontColor: req.body.fontColor || '#023664'
            };

            const certificate = await certificateService.uploadTemplate(req.file, settings);
            
            return res.json({
                success: true,
                message: 'Шаблон успешно загружен',
                data: certificate
            });
        } catch (e) {
            next(e);
        }
    }

    // Загрузка шрифта
    async uploadFont(req, res, next) {
        try {
            if (!req.file) {
                throw ApiError.BadRequest('Файл шрифта не загружен');
            }

            const fontPath = await certificateService.uploadFont(req.file);
            
            return res.json({
                success: true,
                message: 'Шрифт успешно загружен',
                data: { fontPath }
            });
        } catch (e) {
            next(e);
        }
    }

    // Получение настроек шаблона
    async getSettings(req, res, next) {
        try {
            const settings = await certificateService.getSettings();
            
            return res.json({
                success: true,
                data: settings
            });
        } catch (e) {
            next(e);
        }
    }

    // Получение файла шаблона
    async getTemplate(req, res, next) {
        try {
            const template = await certificateService.getActiveTemplate();
            const fs = require('fs').promises;
            
            const fileBuffer = await fs.readFile(template.templatePath);
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="template.pdf"');
            res.send(fileBuffer);
        } catch (e) {
            next(e);
        }
    }

    // Обновление настроек позиции текста
    async updateSettings(req, res, next) {
        try {
            const settings = {
                textX: req.body.textX,
                textY: req.body.textY,
                fontSize: req.body.fontSize,
                fontColor: req.body.fontColor
            };

            const certificate = await certificateService.updateSettings(settings);
            
            return res.json({
                success: true,
                message: 'Настройки обновлены',
                data: certificate
            });
        } catch (e) {
            next(e);
        }
    }

    // Генерация сертификата для одного участника (предпросмотр)
    async generateOne(req, res, next) {
        try {
            const participantId = req.params.participantId;
            
            const result = await certificateService.generateCertificate(participantId);
            
            // Отправляем PDF файл
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="certificate.pdf"; filename*=UTF-8''${encodeURIComponent(result.filename)}`);
            res.send(result.buffer);
        } catch (e) {
            next(e);
        }
    }

    // Предпросмотр сертификата (для первого участника или текущего пользователя)
    async preview(req, res, next) {
        try {
            // Можно использовать ID из параметров или взять первого участника
            let participantId = req.params.participantId || req.user?.id;
            
            if (!participantId) {
                // Берем первого активированного участника для предпросмотра
                const User = require('../models/user-model');
                const firstParticipant = await User.findOne({ 
                    where: { isActivated: true },
                    order: [['id', 'ASC']]
                });
                
                if (!firstParticipant) {
                    throw ApiError.BadRequest('Нет участников для предпросмотра');
                }
                
                participantId = firstParticipant.id;
            }
            
            const result = await certificateService.generateCertificate(participantId);
            
            // Отправляем PDF для предпросмотра
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="preview.pdf"; filename*=UTF-8''${encodeURIComponent('preview_' + result.filename)}`);
            res.send(result.buffer);
        } catch (e) {
            next(e);
        }
    }

    // Генерация всех сертификатов
    async generateAll(req, res, next) {
        try {
            const result = await certificateService.generateAllCertificates();
            
            return res.json({
                success: true,
                message: 'Сертификаты сгенерированы',
                data: result
            });
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new CertificateController();

