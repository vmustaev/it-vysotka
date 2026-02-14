const { exec } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const util = require('util');

const execPromise = util.promisify(exec);

class BackupService {
    constructor() {
        this.backupsDir = path.join(__dirname, '../backups');
        this.ensureBackupsDir();
    }

    async ensureBackupsDir() {
        try {
            await fs.mkdir(this.backupsDir, { recursive: true });
        } catch (err) {
            console.error('Ошибка создания папки бэкапов:', err);
        }
    }

    async createBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `backup_${timestamp}.sql`;
        const filepath = path.join(this.backupsDir, filename);

        const host = process.env.DB_HOST || 'localhost';
        const port = process.env.DB_PORT || 5432;
        const db = process.env.DB_NAME || 'it_vysotka';
        const user = process.env.DB_USER || 'admin';
        const password = process.env.DB_PASSWORD || '';

        const env = { ...process.env, PGPASSWORD: password };
        // Исключаем таблицу schools – она большая, заполняется скриптом import-schools.js
        const cmd = `pg_dump -h ${host} -p ${port} -U ${user} -d ${db} -F p --no-owner --no-acl --exclude-table=schools -f "${filepath}"`;

        try {
            await execPromise(cmd, { env, maxBuffer: 50 * 1024 * 1024 });
            const stat = await fs.stat(filepath);
            await this.cleanupOldBackups(30); // храним последние 30 бэкапов
            return { filename, filepath, size: stat.size, createdAt: new Date() };
        } catch (err) {
            console.error('Ошибка создания бэкапа:', err);
            throw new Error('Не удалось создать бэкап базы данных: ' + (err.message || err.stderr || err));
        }
    }

    async listBackups() {
        await this.ensureBackupsDir();
        try {
            const files = await fs.readdir(this.backupsDir);
            const backups = [];

            for (const file of files) {
                if (!file.endsWith('.sql')) continue;
                const filepath = path.join(this.backupsDir, file);
                const stat = await fs.stat(filepath);
                if (stat.isFile()) {
                    backups.push({
                        filename: file,
                        size: stat.size,
                        createdAt: stat.mtime
                    });
                }
            }

            return backups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } catch (err) {
            console.error('Ошибка чтения списка бэкапов:', err);
            return [];
        }
    }

    getBackupPath(filename) {
        const safeName = path.basename(filename);
        if (!safeName.endsWith('.sql')) {
            throw new Error('Недопустимый формат файла');
        }
        return path.join(this.backupsDir, safeName);
    }

    async getBackupStream(filename) {
        const filepath = this.getBackupPath(filename);
        try {
            await fs.access(filepath);
            return require('fs').createReadStream(filepath);
        } catch (err) {
            throw new Error('Бэкап не найден');
        }
    }

    async deleteBackup(filename) {
        const filepath = this.getBackupPath(filename);
        await fs.unlink(filepath);
        return { message: 'Бэкап удален' };
    }

    async cleanupOldBackups(keepCount = 30) {
        const backups = await this.listBackups();
        if (backups.length <= keepCount) return;
        const toDelete = backups.slice(keepCount);
        for (const b of toDelete) {
            try {
                await fs.unlink(this.getBackupPath(b.filename));
            } catch (e) {
                console.warn('Не удалось удалить старый бэкап:', b.filename);
            }
        }
    }
}

module.exports = new BackupService();
