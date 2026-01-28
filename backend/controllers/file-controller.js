const fileService = require('../service/file-service');
const ApiError = require('../exceptions/api-error');

class FileController {
    async upload(req, res, next) {
        try {
            if (!req.file) {
                throw ApiError.BadRequest('Файл не предоставлен');
            }

            const { fileType, description, subType, year, displayOrder } = req.body;

            if (!fileType) {
                throw ApiError.BadRequest('Не указан тип файла');
            }

            const validTypes = ['gallery', 'sponsors', 'certificates', 'tasks', 'regulations', 'results', 'other'];
            if (!validTypes.includes(fileType)) {
                throw ApiError.BadRequest('Недопустимый тип файла');
            }

            const uploadedBy = req.user?.id || null;

            const file = await fileService.uploadFile(
                req.file, 
                fileType, 
                description, 
                uploadedBy, 
                subType || null,
                year ? parseInt(year) : null,
                displayOrder ? parseInt(displayOrder) : 0
            );

            return res.json({
                success: true,
                message: 'Файл успешно загружен',
                file: {
                    id: file.id,
                    filename: file.filename,
                    fileType: file.fileType,
                    filepath: file.filepath,
                    url: `/files/${file.savedFilename}`,
                    size: file.size,
                    mimetype: file.mimetype,
                    description: file.description,
                    subType: file.subType,
                    year: file.year,
                    displayOrder: file.displayOrder,
                    createdAt: file.createdAt
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req, res, next) {
        try {
            const { fileType, isActive, uploadedBy } = req.query;

            const filters = {};
            if (fileType) filters.fileType = fileType;
            if (isActive !== undefined) filters.isActive = isActive === 'true';
            if (uploadedBy) filters.uploadedBy = parseInt(uploadedBy);

            const files = await fileService.getFiles(filters);

            const filesWithUrls = files.map(file => ({
                id: file.id,
                filename: file.filename,
                fileType: file.fileType,
                filepath: file.filepath,
                url: `/files/${file.savedFilename}`,
                size: file.size,
                mimetype: file.mimetype,
                description: file.description,
                isActive: file.isActive,
                uploadedBy: file.uploadedBy,
                subType: file.subType,
                year: file.year,
                displayOrder: file.displayOrder,
                createdAt: file.createdAt,
                updatedAt: file.updatedAt
            }));

            return res.json({
                success: true,
                count: filesWithUrls.length,
                files: filesWithUrls
            });
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const { id } = req.params;

            const file = await fileService.getFileById(id);

            return res.json({
                success: true,
                file: {
                    id: file.id,
                    filename: file.filename,
                    fileType: file.fileType,
                    filepath: file.filepath,
                    url: `/files/${file.savedFilename}`,
                    size: file.size,
                    mimetype: file.mimetype,
                    description: file.description,
                    isActive: file.isActive,
                    uploadedBy: file.uploadedBy,
                    createdAt: file.createdAt,
                    updatedAt: file.updatedAt
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async getByType(req, res, next) {
        try {
            const { type } = req.params;
            const { subType, year } = req.query;

            const validTypes = ['gallery', 'sponsors', 'certificates', 'tasks', 'regulations', 'results', 'other'];
            if (!validTypes.includes(type)) {
                throw ApiError.BadRequest('Недопустимый тип файла');
            }

            const filters = {};
            if (subType) filters.subType = subType;
            if (year) filters.year = parseInt(year);

            const files = await fileService.getFilesByType(type, filters);

            const filesWithUrls = files.map(file => ({
                id: file.id,
                filename: file.filename,
                fileType: file.fileType,
                filepath: file.filepath,
                url: `/files/${file.savedFilename}`,
                size: file.size,
                mimetype: file.mimetype,
                description: file.description,
                subType: file.subType,
                year: file.year,
                displayOrder: file.displayOrder,
                createdAt: file.createdAt,
                updatedAt: file.updatedAt
            }));

            return res.json({
                success: true,
                type: type,
                count: filesWithUrls.length,
                files: filesWithUrls
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const file = await fileService.updateFile(id, updateData);

            return res.json({
                success: true,
                message: 'Файл успешно обновлен',
                file: {
                    id: file.id,
                    filename: file.filename,
                    fileType: file.fileType,
                    filepath: file.filepath,
                    url: `/files/${file.savedFilename}`,
                    size: file.size,
                    mimetype: file.mimetype,
                    description: file.description,
                    isActive: file.isActive,
                    updatedAt: file.updatedAt
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;

            const result = await fileService.deleteFile(id);

            return res.json({
                success: true,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }

    async getStats(req, res, next) {
        try {
            const stats = await fileService.getFileStats();

            return res.json({
                success: true,
                stats: stats.map(stat => ({
                    fileType: stat.fileType,
                    count: parseInt(stat.dataValues.count),
                    totalSize: parseInt(stat.dataValues.totalSize || 0)
                }))
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new FileController();
