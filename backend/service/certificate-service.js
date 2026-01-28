const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs').promises;
const path = require('path');
const Certificate = require('../models/certificate-model');
const User = require('../models/user-model');
const ApiError = require('../exceptions/api-error');

class CertificateService {
    
    // Загрузка шаблона сертификата
    async uploadTemplate(file, settings) {
        try {
            // Сохраняем файл в папке files
            const uploadsDir = path.join(__dirname, '..', 'files', 'certificates');
            
            // Создаем папку, если её нет
            try {
                await fs.access(uploadsDir);
            } catch {
                await fs.mkdir(uploadsDir, { recursive: true });
            }

            const templatePath = path.join(uploadsDir, `template_${Date.now()}.pdf`);
            await fs.writeFile(templatePath, file.buffer);

            // Получаем размеры страницы из PDF
            const pdfDoc = await PDFDocument.load(file.buffer);
            const pages = pdfDoc.getPages();
            const firstPage = pages[0];
            const { width, height } = firstPage.getSize();

            // Сохраняем fontPath из старой записи перед удалением
            let existingFontPath = null;
            const oldCertificates = await Certificate.findAll({ where: {} });
            
            if (oldCertificates.length > 0) {
                existingFontPath = oldCertificates[0].fontPath;
            }

            // Удаляем старые шаблоны (только файлы шаблонов, не шрифты!)
            for (const oldCert of oldCertificates) {
                try {
                    // Удаляем только файл шаблона, не шрифт
                    await fs.unlink(oldCert.templatePath);
                } catch (unlinkError) {
                    console.log('Не удалось удалить старый файл шаблона:', unlinkError.message);
                }
                // Удаляем запись из БД
                await oldCert.destroy();
            }

            // Создаем новую запись с сохраненным fontPath
            const certificate = await Certificate.create({
                templatePath: templatePath,
                textX: settings.textX || Math.round(width / 2),
                textY: settings.textY || Math.round(height / 2),
                fontSize: settings.fontSize || 110,
                fontColor: settings.fontColor || '#023664',
                fontPath: existingFontPath, // Используем сохраненный fontPath
                isActive: true
            });

            // Возвращаем сертификат с информацией о размерах
            return {
                ...certificate.toJSON(),
                templateWidth: width,
                templateHeight: height
            };
        } catch (e) {
            console.error('Ошибка загрузки шаблона:', e);
            throw ApiError.BadRequest('Ошибка загрузки шаблона сертификата');
        }
    }

    // Загрузка шрифта
    async uploadFont(file) {
        try {
            const uploadsDir = path.join(__dirname, '..', 'files', 'fonts');
            
            // Создаем папку, если её нет
            try {
                await fs.access(uploadsDir);
            } catch {
                await fs.mkdir(uploadsDir, { recursive: true });
            }

            const fontPath = path.join(uploadsDir, `font_${Date.now()}.ttf`);
            await fs.writeFile(fontPath, file.buffer);

            // Обновляем активный сертификат
            const activeCertificate = await Certificate.findOne({ where: { isActive: true } });
            if (activeCertificate) {
                // Удаляем старый файл шрифта, если он есть
                if (activeCertificate.fontPath) {
                    try {
                        await fs.unlink(activeCertificate.fontPath);
                    } catch (unlinkError) {
                        console.log('Не удалось удалить старый файл шрифта:', unlinkError.message);
                    }
                }
                
                activeCertificate.fontPath = fontPath;
                await activeCertificate.save();
            }

            return fontPath;
        } catch (e) {
            console.error('Ошибка загрузки шрифта:', e);
            throw ApiError.BadRequest('Ошибка загрузки шрифта');
        }
    }

    // Получение активного шаблона
    async getActiveTemplate() {
        const certificate = await Certificate.findOne({ where: { isActive: true } });
        if (!certificate) {
            throw ApiError.BadRequest('Шаблон сертификата не загружен');
        }
        return certificate;
    }

    // Обновление настроек позиции текста
    async updateSettings(settings) {
        const certificate = await this.getActiveTemplate();
        
        if (settings.textX !== undefined) certificate.textX = settings.textX;
        if (settings.textY !== undefined) certificate.textY = settings.textY;
        if (settings.fontSize !== undefined) certificate.fontSize = settings.fontSize;
        if (settings.fontColor !== undefined) certificate.fontColor = settings.fontColor;

        await certificate.save();
        return certificate;
    }

    // Генерация одного сертификата для участника
    async generateCertificate(participantId) {
        try {
            // Получаем участника
            const participant = await User.findByPk(participantId);
            if (!participant) {
                throw ApiError.BadRequest('Участник не найден');
            }

            // Получаем активный шаблон
            const certificate = await this.getActiveTemplate();

            // Загружаем шаблон PDF
            const templateBytes = await fs.readFile(certificate.templatePath);
            const pdfDoc = await PDFDocument.load(templateBytes);

            // Регистрируем fontkit для поддержки кастомных шрифтов
            pdfDoc.registerFontkit(fontkit);

            // Загружаем шрифт
            let font;
            if (certificate.fontPath) {
                try {
                    const fontBytes = await fs.readFile(certificate.fontPath);
                    font = await pdfDoc.embedFont(fontBytes);
                } catch (fontError) {
                    console.error('Ошибка загрузки кастомного шрифта:', fontError);
                    // Используем стандартный шрифт как fallback
                    font = await pdfDoc.embedFont('Helvetica-Bold');
                }
            } else {
                // Используем стандартный шрифт
                font = await pdfDoc.embedFont('Helvetica-Bold');
            }

            // Получаем первую страницу
            const pages = pdfDoc.getPages();
            const firstPage = pages[0];

            // Формируем ФИО участника (только фамилия и имя)
            const fullName = `${participant.last_name} ${participant.first_name}`.trim();

            // Преобразуем цвет из HEX в RGB
            const hexColor = certificate.fontColor.replace('#', '');
            const r = parseInt(hexColor.substr(0, 2), 16) / 255;
            const g = parseInt(hexColor.substr(2, 2), 16) / 255;
            const b = parseInt(hexColor.substr(4, 2), 16) / 255;

            // Получаем размеры страницы
            const { width: pageWidth } = firstPage.getSize();

            // Вычисляем ширину текста для центрирования по горизонтали
            const textWidth = font.widthOfTextAtSize(fullName, certificate.fontSize);

            // X - автоматически центр страницы
            // Y - из настроек (вертикальная позиция) - это будет baseline текста
            const x = (pageWidth / 2) - (textWidth / 2);
            const y = certificate.textY;

            // Добавляем текст на страницу
            firstPage.drawText(fullName, {
                x: x,
                y: y,
                size: certificate.fontSize,
                font: font,
                color: rgb(r, g, b)
            });

            // Сохраняем PDF
            const pdfBytes = await pdfDoc.save();

            return {
                buffer: Buffer.from(pdfBytes),
                filename: `certificate_${participant.id}_${participant.last_name}.pdf`,
                participant: {
                    id: participant.id,
                    fullName: fullName,
                    email: participant.email
                }
            };
        } catch (e) {
            console.error('Ошибка генерации сертификата:', e);
            throw ApiError.BadRequest('Ошибка генерации сертификата: ' + e.message);
        }
    }

    // Генерация сертификатов для всех участников
    async generateAllCertificates() {
        try {
            // Получаем всех активированных участников
            const participants = await User.findAll({ 
                where: { isActivated: true },
                attributes: ['id', 'first_name', 'last_name', 'second_name', 'email']
            });

            const results = [];
            const errors = [];

            for (const participant of participants) {
                try {
                    const result = await this.generateCertificate(participant.id);
                    results.push(result);
                } catch (e) {
                    errors.push({
                        participantId: participant.id,
                        error: e.message
                    });
                }
            }

            return {
                success: results.length,
                failed: errors.length,
                total: participants.length,
                errors: errors
            };
        } catch (e) {
            console.error('Ошибка генерации всех сертификатов:', e);
            throw ApiError.BadRequest('Ошибка генерации сертификатов');
        }
    }

    // Получение настроек текущего шаблона
    async getSettings() {
        const certificate = await Certificate.findOne({ where: { isActive: true } });
        
        if (!certificate) {
            return null;
        }

        // Получаем размеры шаблона из PDF
        try {
            const templateBytes = await fs.readFile(certificate.templatePath);
            const pdfDoc = await PDFDocument.load(templateBytes);
            const pages = pdfDoc.getPages();
            const firstPage = pages[0];
            const { width, height } = firstPage.getSize();

            return {
                ...certificate.toJSON(),
                templateWidth: width,
                templateHeight: height
            };
        } catch (e) {
            console.error('Ошибка получения размеров шаблона:', e);
            return certificate;
        }
    }
}

module.exports = new CertificateService();

