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
            const filename = `certificate_${result.participant.fullName.replace(/\s+/g, '_')}.pdf`;
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="certificate.pdf"; filename*=UTF-8''${encodeURIComponent(filename)}`);
            res.send(Buffer.from(result.pdfBytes));
        } catch (e) {
            next(e);
        }
    }

    // Предпросмотр сертификата (для первого участника или текущего пользователя)
    async preview(req, res, next) {
        try {
            // Всегда используем null для предпросмотра - будет статичный текст "Иванов Иван"
            const result = await certificateService.generateCertificate(null);
            
            // Отправляем PDF для предпросмотра
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="preview.pdf"');
            res.send(Buffer.from(result.pdfBytes));
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

    // Выдача сертификатов выбранным участникам
    async issueCertificates(req, res, next) {
        try {
            const { participantIds } = req.body;
            
            if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
                throw ApiError.BadRequest('Не указаны ID участников');
            }

            const result = await certificateService.issueСertificatesToParticipants(participantIds);
            
            return res.json({
                success: true,
                message: `Выдано сертификатов: ${result.success} из ${result.total}`,
                data: result
            });
        } catch (e) {
            next(e);
        }
    }

    // Скачивание сертификата участником (публичный эндпоинт)
    async downloadCertificate(req, res, next) {
        try {
            const participantId = req.params.participantId;
            
            // Проверяем, что пользователь скачивает свой сертификат
            // или является администратором
            if (req.user.role !== 'admin' && req.user.id !== parseInt(participantId)) {
                throw ApiError.Forbidden('Доступ запрещен');
            }

            const result = await certificateService.getParticipantCertificate(participantId);
            
            // Отправляем PDF файл
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(result.filename)}"; filename*=UTF-8''${encodeURIComponent(result.filename)}`);
            res.send(Buffer.from(result.pdfBytes));
        } catch (e) {
            next(e);
        }
    }

    // Отправка писем участникам о выдаче сертификатов (админ)
    async sendCertificateNotifications(req, res, next) {
        try {
            const UserModel = require('../models/user-model');
            const mailService = require('../service/mail-service');

            // Находим всех участников с выданными сертификатами
            const participants = await UserModel.findAll({
                where: {
                    role: 'participant',
                    isActivated: true,
                    certificateId: { [require('sequelize').Op.ne]: null }
                }
            });

            if (!participants || participants.length === 0) {
                throw ApiError.BadRequest('Не найдено участников с выданными сертификатами');
            }

            const profileLink = `${process.env.URL}/profile`;
            let sentCount = 0;
            const errors = [];

            for (const participant of participants) {
                if (!participant.email) {
                    errors.push(`Участник ${participant.last_name} ${participant.first_name} (ID: ${participant.id}) не имеет email`);
                    continue;
                }

                try {
                    const fullName = `${participant.last_name} ${participant.first_name}${participant.second_name ? ' ' + participant.second_name : ''}`;
                    await mailService.sendCertificateIssuedMail(
                        participant.email,
                        fullName,
                        profileLink
                    );
                    sentCount++;
                } catch (error) {
                    console.error(`Ошибка отправки письма участнику ${participant.email}:`, error);
                    errors.push(`Не удалось отправить письмо на ${participant.email}: ${error.message}`);
                }
            }

            return res.json({
                success: true,
                message: `Отправлено писем: ${sentCount} из ${participants.length}`,
                data: {
                    sent: sentCount,
                    total: participants.length,
                    errors: errors
                }
            });
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new CertificateController();

