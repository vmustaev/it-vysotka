const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/user-model');
const FileModel = require('../models/file-model');
const Setting = require('../models/settings-model');
const ApiError = require('../exceptions/api-error');

class CertificateService {
    
    // Получение настройки из settings
    async getSetting(key, defaultValue = null) {
        const setting = await Setting.findOne({ where: { key } });
        return setting ? setting.value : defaultValue;
    }

    // Установка настройки в settings
    async setSetting(key, value) {
        const [setting] = await Setting.findOrCreate({
            where: { key },
            defaults: { value: String(value) }
        });
        setting.value = String(value);
        await setting.save();
        return setting;
    }

    // Загрузка шаблона сертификата
    async uploadTemplate(file, settings) {
        try {
            // Сохраняем файл в общей папке files
            const uploadsDir = path.join(__dirname, '..', 'files');
            
            const savedFilename = `template_${uuidv4()}.pdf`;
            const templatePath = path.join(uploadsDir, savedFilename);
            await fs.writeFile(templatePath, file.buffer);

            // Получаем размеры страницы из PDF
            const pdfDoc = await PDFDocument.load(file.buffer);
            const pages = pdfDoc.getPages();
            const firstPage = pages[0];
            const { width, height } = firstPage.getSize();

            // Удаляем старый файл шаблона из файловой системы, если он есть
            const oldTemplateId = await this.getSetting('certificate_template_id');
            if (oldTemplateId) {
                try {
                    const oldFile = await FileModel.findByPk(oldTemplateId);
                    if (oldFile) {
                        const oldPath = path.join(__dirname, '..', 'files', oldFile.savedFilename);
                        await fs.unlink(oldPath);
                        await oldFile.destroy();
                    }
                } catch (unlinkError) {
                    console.log('Не удалось удалить старый файл шаблона:', unlinkError.message);
                }
            }

            // Создаем запись в таблице files
            const fileRecord = await FileModel.create({
                filename: file.originalname || 'certificate_template.pdf',
                savedFilename: savedFilename,
                filepath: savedFilename,
                fileType: 'certificates',
                mimetype: file.mimetype || 'application/pdf',
                size: file.size,
                description: 'Шаблон сертификата',
                isActive: true,
                uploadedBy: null
            });

            // Сохраняем настройки в settings
            await this.setSetting('certificate_template_id', fileRecord.id);
            await this.setSetting('certificate_text_x', settings.textX || Math.round(width / 2));
            await this.setSetting('certificate_text_y', settings.textY || Math.round(height / 2));
            await this.setSetting('certificate_font_size', settings.fontSize || 110);
            await this.setSetting('certificate_font_color', settings.fontColor || '#023664');

            // Возвращаем информацию
            return {
                templateId: fileRecord.id,
                templatePath: templatePath,
                textX: settings.textX || Math.round(width / 2),
                textY: settings.textY || Math.round(height / 2),
                fontSize: settings.fontSize || 110,
                fontColor: settings.fontColor || '#023664',
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
            // Сохраняем файл в общей папке files
            const uploadsDir = path.join(__dirname, '..', 'files');

            const savedFilename = `font_${uuidv4()}.ttf`;
            const fontPath = path.join(uploadsDir, savedFilename);
            await fs.writeFile(fontPath, file.buffer);

            // Удаляем старый файл шрифта из файловой системы, если он есть
            const oldFontId = await this.getSetting('certificate_font_id');
            if (oldFontId) {
                try {
                    const oldFile = await FileModel.findByPk(oldFontId);
                    if (oldFile) {
                        const oldPath = path.join(__dirname, '..', 'files', oldFile.savedFilename);
                        await fs.unlink(oldPath);
                        await oldFile.destroy();
                    }
                } catch (unlinkError) {
                    console.log('Не удалось удалить старый файл шрифта:', unlinkError.message);
                }
            }

            // Создаем запись в таблице files
            const fileRecord = await FileModel.create({
                filename: file.originalname || 'certificate_font.ttf',
                savedFilename: savedFilename,
                filepath: savedFilename,
                fileType: 'certificates',
                mimetype: file.mimetype || 'font/ttf',
                size: file.size,
                description: 'Шрифт для сертификатов',
                isActive: true,
                uploadedBy: null
            });

            // Сохраняем ID файла шрифта
            await this.setSetting('certificate_font_id', fileRecord.id);

            return fontPath;
        } catch (e) {
            console.error('Ошибка загрузки шрифта:', e);
            throw ApiError.BadRequest('Ошибка загрузки шрифта');
        }
    }

    // Получение активного шаблона
    async getActiveTemplate() {
        const templateId = await this.getSetting('certificate_template_id');
        if (!templateId) {
            throw ApiError.BadRequest('Шаблон сертификата не загружен');
        }
        
        // Получаем файл шаблона из файловой системы
        const templateFile = await FileModel.findByPk(templateId);
        if (!templateFile) {
            throw ApiError.BadRequest('Файл шаблона не найден');
        }
        
        const templatePath = path.join(__dirname, '..', 'files', templateFile.savedFilename);
        
        // Получаем файл шрифта, если он есть
        let fontPath = null;
        const fontId = await this.getSetting('certificate_font_id');
        if (fontId) {
            const fontFile = await FileModel.findByPk(fontId);
            if (fontFile) {
                fontPath = path.join(__dirname, '..', 'files', fontFile.savedFilename);
            }
        }
        
        return {
            templateId: templateFile.id,
            templatePath,
            textX: parseFloat(await this.getSetting('certificate_text_x', 0)),
            textY: parseFloat(await this.getSetting('certificate_text_y', 0)),
            fontSize: parseInt(await this.getSetting('certificate_font_size', 110)),
            fontColor: await this.getSetting('certificate_font_color', '#023664'),
            fontId: fontId ? parseInt(fontId) : null,
            fontPath
        };
    }

    // Получение настроек для фронтенда
    async getSettings() {
        const templateId = await this.getSetting('certificate_template_id');
        if (!templateId) {
            throw ApiError.BadRequest('Шаблон сертификата не загружен');
        }

        // Получаем размеры шаблона
        const templateFile = await FileModel.findByPk(templateId);
        if (!templateFile) {
            throw ApiError.BadRequest('Файл шаблона не найден');
        }

        const templatePath = path.join(__dirname, '..', 'files', templateFile.savedFilename);
        const templateBytes = await fs.readFile(templatePath);
        const pdfDoc = await PDFDocument.load(templateBytes);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const { width, height } = firstPage.getSize();

        const fontId = await this.getSetting('certificate_font_id');

        return {
            textX: parseFloat(await this.getSetting('certificate_text_x', 0)),
            textY: parseFloat(await this.getSetting('certificate_text_y', 0)),
            fontSize: parseInt(await this.getSetting('certificate_font_size', 110)),
            fontColor: await this.getSetting('certificate_font_color', '#023664'),
            templateWidth: width,
            templateHeight: height,
            fontPath: fontId ? 'loaded' : null
        };
    }

    // Обновление настроек позиции текста
    async updateSettings(settings) {
        if (settings.textX !== undefined) {
            await this.setSetting('certificate_text_x', settings.textX);
        }
        if (settings.textY !== undefined) {
            await this.setSetting('certificate_text_y', settings.textY);
        }
        if (settings.fontSize !== undefined) {
            await this.setSetting('certificate_font_size', settings.fontSize);
        }
        if (settings.fontColor !== undefined) {
            await this.setSetting('certificate_font_color', settings.fontColor);
        }
        
        return await this.getActiveTemplate();
    }

    // Генерация сертификата для участника
    async generateCertificate(participantId = null) {
        try {
            let fullName;
            
            // Если ID не указан, используем тестовое имя для предпросмотра
            if (!participantId) {
                fullName = 'Иванов Иван';
            } else {
                // Получаем данные участника
                const participant = await User.findByPk(participantId);
                if (!participant) {
                    throw ApiError.BadRequest('Участник не найден');
                }
                // ФИО участника (только фамилия и имя)
                fullName = `${participant.last_name} ${participant.first_name}`.trim();
            }

            // Получаем настройки сертификата
            const certificate = await this.getActiveTemplate();

            // Загружаем шаблон
            const templateBytes = await fs.readFile(certificate.templatePath);
            const pdfDoc = await PDFDocument.load(templateBytes);

            // Регистрируем fontkit
            pdfDoc.registerFontkit(fontkit);

            // Загружаем шрифт
            let font;
            if (certificate.fontPath) {
                try {
                    const fontBytes = await fs.readFile(certificate.fontPath);
                    font = await pdfDoc.embedFont(fontBytes);
                } catch (fontError) {
                    console.error('Ошибка загрузки шрифта:', fontError);
                    throw ApiError.BadRequest('Ошибка загрузки шрифта. Пожалуйста, загрузите файл шрифта.');
                }
            } else {
                throw ApiError.BadRequest('Файл шрифта не загружен');
            }

            // Получаем первую страницу
            const pages = pdfDoc.getPages();
            const firstPage = pages[0];
            
            // Парсим цвет
            const colorMatch = certificate.fontColor.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
            const color = colorMatch 
                ? rgb(
                    parseInt(colorMatch[1], 16) / 255,
                    parseInt(colorMatch[2], 16) / 255,
                    parseInt(colorMatch[3], 16) / 255
                  )
                : rgb(0, 0.21, 0.39); // Цвет по умолчанию #023664

            // Добавляем текст на страницу
            const textWidth = font.widthOfTextAtSize(fullName, certificate.fontSize);
            firstPage.drawText(fullName, {
                x: certificate.textX - (textWidth / 2),
                y: certificate.textY,
                size: certificate.fontSize,
                font: font,
                color: color
            });

            // Сохраняем PDF
            const pdfBytes = await pdfDoc.save();

            // Возвращаем информацию
            return {
                participant: {
                    id: participantId || null,
                    fullName: fullName
                },
                pdfBytes: pdfBytes
            };
        } catch (e) {
            console.error('Ошибка генерации сертификата:', e);
            throw ApiError.BadRequest(e.message || 'Ошибка генерации сертификата');
        }
    }

    // Массовая выдача сертификатов всем участникам
    async issueСertificatesToParticipants(participantIds) {
        const results = [];
        
        // Папка для сохранения сгенерированных сертификатов - общая папка files
        const certificatesDir = path.join(__dirname, '..', 'files');

        for (const participantId of participantIds) {
            try {
                const result = await this.generateCertificate(participantId);
                const participant = await User.findByPk(participantId);

                // Удаляем старый сертификат, если он есть
                if (participant.certificateId) {
                    try {
                        const oldCertificate = await FileModel.findByPk(participant.certificateId);
                        if (oldCertificate) {
                            const oldPath = path.join(certificatesDir, oldCertificate.savedFilename);
                            await fs.unlink(oldPath);
                            await oldCertificate.destroy();
                            console.log(`Удален старый сертификат для участника ${participantId}`);
                        }
                    } catch (deleteError) {
                        console.log(`Не удалось удалить старый сертификат: ${deleteError.message}`);
                    }
                }

                // Сохраняем PDF в файл
                const certificateFile = `cert_${uuidv4()}.pdf`;
                await fs.writeFile(
                    path.join(certificatesDir, certificateFile),
                    result.pdfBytes
                );

                // Создаем запись в таблице files
                if (certificateFile) {
                    const file = await FileModel.create({
                        filename: `Сертификат_${participant.last_name}_${participant.first_name}.pdf`,
                        savedFilename: certificateFile,
                        filepath: certificateFile,
                        fileType: 'certificates',
                        mimetype: 'application/pdf',
                        size: (await fs.stat(path.join(certificatesDir, certificateFile))).size,
                        description: `Сертификат для ${participant.last_name} ${participant.first_name}`,
                        isActive: true,
                        uploadedBy: null
                    });

                    // Сохраняем ID файла в пользователе
                    participant.certificateId = file.id;
                    await participant.save();

                    results.push({
                        participantId: participantId,
                        fullName: result.participant.fullName,
                        certificateId: file.id
                    });
                }
            } catch (e) {
                console.error(`Ошибка выдачи сертификата участнику ${participantId}:`, e);
                results.push({
                    participantId: participantId,
                    error: e.message
                });
            }
        }

        // Подсчитываем успешные и неудачные
        const successCount = results.filter(r => !r.error).length;
        const errorCount = results.filter(r => r.error).length;

        return {
            success: successCount,
            error: errorCount,
            total: results.length,
            results: results
        };
    }

    // Получение сертификата участника
    async getParticipantCertificate(participantId) {
        const participant = await User.findByPk(participantId, {
            include: [{ model: FileModel, as: 'Certificate' }]
        });

        if (!participant) {
            throw ApiError.BadRequest('Участник не найден');
        }

        if (!participant.certificateId) {
            throw ApiError.BadRequest('Сертификат не был выдан этому участнику');
        }

        const certificateFile = participant.Certificate;
        if (!certificateFile) {
            throw ApiError.BadRequest('Файл сертификата не найден');
        }

        const certificatePath = path.join(__dirname, '..', 'files', certificateFile.savedFilename);
        
        try {
            const pdfBytes = await fs.readFile(certificatePath);
            return {
                participant: {
                    id: participant.id,
                    fullName: `${participant.last_name} ${participant.first_name}`.trim()
                },
                pdfBytes: pdfBytes,
                filename: certificateFile.filename
            };
        } catch (e) {
            console.error('Ошибка чтения файла сертификата:', e);
            throw ApiError.BadRequest('Не удалось прочитать файл сертификата');
        }
    }

    // Предпросмотр сертификата с тестовыми данными
    async previewCertificate(testName = 'Иванов Иван Иванович') {
        try {
            // Получаем настройки сертификата
            const certificate = await this.getActiveTemplate();

            // Загружаем шаблон
            const templateBytes = await fs.readFile(certificate.templatePath);
            const pdfDoc = await PDFDocument.load(templateBytes);

            // Регистрируем fontkit
            pdfDoc.registerFontkit(fontkit);

            // Загружаем шрифт
            let font;
            if (certificate.fontPath) {
                try {
                    const fontBytes = await fs.readFile(certificate.fontPath);
                    font = await pdfDoc.embedFont(fontBytes);
                } catch (fontError) {
                    console.error('Ошибка загрузки шрифта:', fontError);
                    throw ApiError.BadRequest('Ошибка загрузки шрифта. Пожалуйста, загрузите файл шрифта.');
                }
            } else {
                throw ApiError.BadRequest('Файл шрифта не загружен');
            }

            // Получаем первую страницу
            const pages = pdfDoc.getPages();
            const firstPage = pages[0];
            
            // Парсим цвет
            const colorMatch = certificate.fontColor.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
            const color = colorMatch 
                ? rgb(
                    parseInt(colorMatch[1], 16) / 255,
                    parseInt(colorMatch[2], 16) / 255,
                    parseInt(colorMatch[3], 16) / 255
                  )
                : rgb(0, 0.21, 0.39);

            // Добавляем текст на страницу
            const textWidth = font.widthOfTextAtSize(testName, certificate.fontSize);
            firstPage.drawText(testName, {
                x: certificate.textX - (textWidth / 2),
                y: certificate.textY,
                size: certificate.fontSize,
                font: font,
                color: color
            });

            // Сохраняем PDF
            const pdfBytes = await pdfDoc.save();

            return {
                pdfBytes: pdfBytes
            };
        } catch (e) {
            console.error('Ошибка предпросмотра сертификата:', e);
            throw ApiError.BadRequest(e.message || 'Ошибка предпросмотра сертификата');
        }
    }
}

module.exports = new CertificateService();
