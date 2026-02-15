const FileModel = require('../models/file-model');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const ApiError = require('../exceptions/api-error');

class FileService {
    async uploadFile(fileData, fileType, description, uploadedBy, subType = null, year = null, displayOrder = null) {
        try {
            // Генерируем уникальное имя файла
            const fileExtension = path.extname(fileData.originalname);
            const savedFilename = `${uuidv4()}${fileExtension}`;
            const fullPath = path.join(__dirname, '../files', savedFilename);

            // Сохраняем файл
            await fs.writeFile(fullPath, fileData.buffer);

            // Для спонсоров и задач автоматически ставим в конец
            let finalDisplayOrder = displayOrder;
            if ((fileType === 'sponsors' || fileType === 'tasks') && displayOrder === null) {
                const maxOrder = await FileModel.max('displayOrder', {
                    where: { fileType }
                });
                finalDisplayOrder = (maxOrder || 0) + 1;
            }

            // Создаем запись в БД
            const file = await FileModel.create({
                filename: fileData.originalname,
                savedFilename,
                fileType,
                mimetype: fileData.mimetype,
                size: fileData.size,
                description: description || null,
                uploadedBy: uploadedBy || null,
                isActive: true,
                subType: subType || null,
                year: year || null,
                displayOrder: finalDisplayOrder || 0
            });

            return file;
        } catch (error) {
            console.error('Error in uploadFile:', error);
            throw ApiError.BadRequest('Ошибка при загрузке файла');
        }
    }

    async getFiles(filters = {}) {
        try {
            const where = {};

            if (filters.fileType) {
                where.fileType = filters.fileType;
            }

            if (filters.isActive !== undefined) {
                where.isActive = filters.isActive;
            }

            if (filters.uploadedBy) {
                where.uploadedBy = filters.uploadedBy;
            }

            // Определяем сортировку в зависимости от типа
            let orderBy = [['createdAt', 'DESC']];
            if (filters.fileType === 'sponsors') {
                orderBy = [['displayOrder', 'ASC'], ['createdAt', 'DESC']];
            } else if (filters.fileType === 'tasks') {
                orderBy = [['year', 'DESC'], ['displayOrder', 'ASC'], ['createdAt', 'DESC']];
            }

            const files = await FileModel.findAll({
                where,
                order: orderBy
            });

            return files;
        } catch (error) {
            console.error('Error in getFiles:', error);
            throw ApiError.BadRequest('Ошибка при получении списка файлов');
        }
    }

    async getFileById(id) {
        try {
            const file = await FileModel.findByPk(id);

            if (!file) {
                throw ApiError.NotFound('Файл не найден');
            }

            return file;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error('Error in getFileById:', error);
            throw ApiError.BadRequest('Ошибка при получении файла');
        }
    }

    async updateFile(id, updateData) {
        try {
            const file = await FileModel.findByPk(id);

            if (!file) {
                throw ApiError.NotFound('Файл не найден');
            }

            const allowedFields = ['filename', 'fileType', 'description', 'isActive', 'subType', 'year', 'displayOrder'];
            const updates = {};

            for (const field of allowedFields) {
                if (updateData[field] !== undefined) {
                    updates[field] = updateData[field];
                }
            }

            await file.update(updates);

            return file;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error('Error in updateFile:', error);
            throw ApiError.BadRequest('Ошибка при обновлении файла');
        }
    }

    async deleteFile(id) {
        try {
            const file = await FileModel.findByPk(id);

            if (!file) {
                throw ApiError.NotFound('Файл не найден');
            }

            // Удаляем физический файл
            const fullPath = path.join(__dirname, '../files', file.savedFilename);
            try {
                await fs.unlink(fullPath);
            } catch (fsError) {
                console.warn('Не удалось удалить физический файл:', fsError.message);
            }

            // Удаляем запись из БД
            await file.destroy();

            return { message: 'Файл успешно удален' };
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error('Error in deleteFile:', error);
            throw ApiError.BadRequest('Ошибка при удалении файла');
        }
    }

    async deleteMultipleFiles(ids) {
        try {
            if (!Array.isArray(ids) || ids.length === 0) {
                throw ApiError.BadRequest('Необходимо указать массив ID файлов');
            }

            const results = {
                success: [],
                failed: []
            };

            for (const id of ids) {
                try {
                    const file = await FileModel.findByPk(id);

                    if (!file) {
                        results.failed.push({ id, reason: 'Файл не найден' });
                        continue;
                    }

                    // Удаляем физический файл
                    const fullPath = path.join(__dirname, '../files', file.savedFilename);
                    try {
                        await fs.unlink(fullPath);
                    } catch (fsError) {
                        console.warn(`Не удалось удалить физический файл ${file.savedFilename}:`, fsError.message);
                    }

                    // Удаляем запись из БД
                    await file.destroy();
                    results.success.push(id);
                } catch (error) {
                    console.error(`Error deleting file ${id}:`, error);
                    results.failed.push({ id, reason: error.message });
                }
            }

            return {
                message: `Удалено файлов: ${results.success.length}, ошибок: ${results.failed.length}`,
                results
            };
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.error('Error in deleteMultipleFiles:', error);
            throw ApiError.BadRequest('Ошибка при множественном удалении файлов');
        }
    }

    async getFilesByType(fileType, filters = {}) {
        try {
            const where = {
                fileType,
                isActive: true
            };

            // Добавляем фильтры
            if (filters.subType) {
                where.subType = filters.subType;
            }
            if (filters.year) {
                where.year = filters.year;
            }

            // Определяем порядок сортировки
            let order = [['createdAt', 'DESC']];
            if (fileType === 'sponsors') {
                // Для спонсоров сортируем по displayOrder
                order = [['displayOrder', 'ASC'], ['createdAt', 'DESC']];
            } else if (fileType === 'tasks') {
                // Для заданий сортируем по году и displayOrder
                order = [['year', 'DESC'], ['displayOrder', 'ASC'], ['createdAt', 'DESC']];
            }

            const files = await FileModel.findAll({
                where,
                order
            });

            return files;
        } catch (error) {
            console.error('Error in getFilesByType:', error);
            throw ApiError.BadRequest('Ошибка при получении файлов по типу');
        }
    }

    async getFileStats() {
        try {
            const { Op } = require('sequelize');
            const sequelize = require('../db');

            const stats = await FileModel.findAll({
                attributes: [
                    'fileType',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                    [sequelize.fn('SUM', sequelize.col('size')), 'totalSize']
                ],
                group: ['fileType']
            });

            return stats;
        } catch (error) {
            console.error('Error in getFileStats:', error);
            throw ApiError.BadRequest('Ошибка при получении статистики файлов');
        }
    }
}

module.exports = new FileService();
