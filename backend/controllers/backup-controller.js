const backupService = require('../service/backup-service');
const ApiError = require('../exceptions/api-error');
const fs = require('fs').promises;

class BackupController {
    async create(req, res, next) {
        try {
            const backup = await backupService.createBackup();
            return res.json({
                success: true,
                message: 'Бэкап создан',
                backup: {
                    filename: backup.filename,
                    size: backup.size,
                    createdAt: backup.createdAt
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async list(req, res, next) {
        try {
            const backups = await backupService.listBackups();
            return res.json({
                success: true,
                backups
            });
        } catch (error) {
            next(error);
        }
    }

    async download(req, res, next) {
        try {
            const { filename } = req.params;
            if (!filename) {
                throw ApiError.BadRequest('Имя файла не указано');
            }

            const filepath = backupService.getBackupPath(filename);
            const stat = await fs.stat(filepath).catch(() => null);
            if (!stat || !stat.isFile()) {
                throw ApiError.NotFound('Бэкап не найден');
            }

            res.setHeader('Content-Type', 'application/sql');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', stat.size);

            const stream = await backupService.getBackupStream(filename);
            stream.pipe(res);
        } catch (error) {
            if (error instanceof ApiError) next(error);
            else next(ApiError.NotFound('Бэкап не найден'));
        }
    }

    async delete(req, res, next) {
        try {
            const { filename } = req.params;
            if (!filename) {
                throw ApiError.BadRequest('Имя файла не указано');
            }

            await backupService.deleteBackup(filename);
            return res.json({
                success: true,
                message: 'Бэкап удален'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new BackupController();
