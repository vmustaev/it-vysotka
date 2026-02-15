import React, { useState, useEffect } from 'react';
import FileService from '../../services/FileService';
import BackupService from '../../services/BackupService';
import Toast from '../../components/Toast';
import ConfirmDialog from '../../components/ConfirmDialog';
import '../../styles/file-manager.css';

const FileManager = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState('');
    const [backups, setBackups] = useState([]);
    const [loadingBackups, setLoadingBackups] = useState(false);
    const [creatingBackup, setCreatingBackup] = useState(false);
    const [confirmDeleteBackup, setConfirmDeleteBackup] = useState({ show: false, filename: null });
    const [uploadFiles, setUploadFiles] = useState([]);
    const [uploadType, setUploadType] = useState('gallery');
    const [uploadDescription, setUploadDescription] = useState('');
    const [uploadSubType, setUploadSubType] = useState('');
    const [uploadYear, setUploadYear] = useState(new Date().getFullYear());
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
    const [confirmDialog, setConfirmDialog] = useState({ show: false, fileId: null });
    const [editingFile, setEditingFile] = useState(null);
    const [stats, setStats] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewFile, setPreviewFile] = useState(null);

    // Типы для фильтра (можно просматривать все) + вкладка Бэкапы
    const fileTypes = [
        { value: '', label: 'Все типы' },
        { value: 'gallery', label: 'Галерея' },
        { value: 'sponsors', label: 'Спонсоры' },
        { value: 'certificates', label: 'Сертификаты' },
        { value: 'tasks', label: 'Задания' },
        { value: 'regulations', label: 'Положения' },
        { value: 'backups', label: 'Бэкапы' }
    ];

    // Типы для загрузки (сертификаты загружаются только через раздел "Сертификаты")
    const uploadableTypes = [
        { value: 'gallery', label: 'Галерея' },
        { value: 'sponsors', label: 'Спонсоры' },
        { value: 'tasks', label: 'Задания' },
        { value: 'regulations', label: 'Положения' }
    ];

    useEffect(() => {
        loadBackups(); // Загружаем количество бэкапов для отображения в табе
    }, []);

    useEffect(() => {
        if (selectedType === 'backups') {
            loadBackups();
        } else {
            loadFiles();
            loadStats();
        }
    }, [selectedType]);

    const loadBackups = async () => {
        try {
            setLoadingBackups(true);
            const response = await BackupService.getBackups();
            setBackups(response.backups || []);
        } catch (error) {
            showToast('Ошибка при загрузке списка бэкапов', 'error');
            console.error('Error loading backups:', error);
        } finally {
            setLoadingBackups(false);
        }
    };

    const handleCreateBackup = async () => {
        try {
            setCreatingBackup(true);
            await BackupService.createBackup();
            showToast('Бэкап успешно создан', 'success');
            loadBackups();
        } catch (error) {
            showToast(error.response?.data?.message || 'Ошибка при создании бэкапа', 'error');
            console.error('Error creating backup:', error);
        } finally {
            setCreatingBackup(false);
        }
    };

    const handleDownloadBackup = async (filename) => {
        try {
            const blob = await BackupService.downloadBackup(filename);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showToast('Загрузка началась', 'success');
        } catch (error) {
            showToast('Ошибка при скачивании бэкапа', 'error');
            console.error('Error downloading backup:', error);
        }
    };

    const handleDeleteBackup = async (filename) => {
        try {
            await BackupService.deleteBackup(filename);
            showToast('Бэкап удалён', 'success');
            setConfirmDeleteBackup({ show: false, filename: null });
            loadBackups();
        } catch (error) {
            showToast('Ошибка при удалении бэкапа', 'error');
            console.error('Error deleting backup:', error);
        }
    };

    const loadFiles = async () => {
        try {
            setLoading(true);
            const filters = selectedType ? { fileType: selectedType } : {};
            const response = await FileService.getAllFiles(filters);
            setFiles(response.files);
        } catch (error) {
            showToast('Ошибка при загрузке файлов', 'error');
            console.error('Error loading files:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const response = await FileService.getFileStats();
            setStats(response.stats);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setUploadFiles(files);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        
        if (uploadFiles.length === 0) {
            showToast('Выберите файлы для загрузки', 'error');
            return;
        }

        try {
            setUploading(true);
            setUploadProgress({ current: 0, total: uploadFiles.length });
            
            let successCount = 0;
            let errorCount = 0;
            const errors = [];

            for (let i = 0; i < uploadFiles.length; i++) {
                try {
                    setUploadProgress({ current: i + 1, total: uploadFiles.length });
                    
                    await FileService.uploadFile(
                        uploadFiles[i], 
                        uploadType, 
                        uploadDescription, 
                        uploadSubType, 
                        uploadYear, 
                        null // order будет установлен автоматически на backend
                    );
                    
                    successCount++;
                    
                    // Небольшая задержка между запросами для стабильности
                    if (i < uploadFiles.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                } catch (error) {
                    console.error(`Error uploading ${uploadFiles[i].name}:`, error);
                    errors.push(`${uploadFiles[i].name}: ${error.response?.data?.message || error.message}`);
                    errorCount++;
                }
            }

            // Показываем результат
            if (successCount > 0) {
                showToast(
                    `✅ Загружено: ${successCount} ${errorCount > 0 ? `❌ Ошибок: ${errorCount}` : ''}`, 
                    errorCount > 0 ? 'warning' : 'success'
                );
                
                if (errors.length > 0 && errors.length <= 3) {
                    console.log('Ошибки загрузки:', errors);
                }
            } else {
                showToast('❌ Все файлы не загружены. Проверьте размер и формат файлов.', 'error');
            }

            // Очищаем форму
            setUploadFiles([]);
            setUploadDescription('');
            setUploadSubType('');
            setUploadProgress({ current: 0, total: 0 });
            document.getElementById('file-input').value = '';
            
            // Обновляем список
            loadFiles();
            loadStats();
        } catch (error) {
            showToast('Критическая ошибка при загрузке файлов', 'error');
            console.error('Critical error:', error);
        } finally {
            setUploading(false);
            setUploadProgress({ current: 0, total: 0 });
        }
    };

    const handleDelete = async (fileId) => {
        try {
            await FileService.deleteFile(fileId);
            showToast('Файл успешно удален', 'success');
            setSelectedFiles(prev => prev.filter(id => id !== fileId));
            loadFiles();
            loadStats();
        } catch (error) {
            showToast('Ошибка при удалении файла', 'error');
            console.error('Error deleting file:', error);
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedFiles.length === 0) {
            showToast('Выберите файлы для удаления', 'error');
            return;
        }

        try {
            const response = await FileService.deleteMultipleFiles(selectedFiles);
            
            const successCount = response.results.success.length;
            const errorCount = response.results.failed.length;

            if (successCount > 0) {
                showToast(
                    `✅ Удалено: ${successCount} ${errorCount > 0 ? `❌ Ошибок: ${errorCount}` : ''}`,
                    errorCount > 0 ? 'warning' : 'success'
                );
            } else {
                showToast('❌ Не удалось удалить файлы', 'error');
            }

            setSelectedFiles([]);
            setConfirmDialog({ show: false, fileId: null });
            loadFiles();
            loadStats();
        } catch (error) {
            showToast('Критическая ошибка при удалении файлов', 'error');
            console.error('Critical error:', error);
        }
    };

    const toggleFileSelection = (fileId) => {
        setSelectedFiles(prev => {
            if (prev.includes(fileId)) {
                return prev.filter(id => id !== fileId);
            } else {
                return [...prev, fileId];
            }
        });
    };

    const toggleSelectAll = () => {
        if (selectedFiles.length === files.length) {
            setSelectedFiles([]);
        } else {
            setSelectedFiles(files.map(f => f.id));
        }
    };

    const handleUpdate = async (fileId, updateData) => {
        try {
            await FileService.updateFile(fileId, updateData);
            showToast('Файл успешно обновлен', 'success');
            setEditingFile(null);
            loadFiles();
        } catch (error) {
            showToast('Ошибка при обновлении файла', 'error');
            console.error('Error updating file:', error);
        }
    };

    const showToast = (message, type = 'info') => {
        setToast({ show: true, message, type });
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getFileTypeLabel = (type) => {
        const typeObj = fileTypes.find(t => t.value === type);
        return typeObj ? typeObj.label : type;
    };

    const handleChangeOrder = async (fileId, newOrder) => {
        try {
            await FileService.updateFile(fileId, { displayOrder: parseInt(newOrder) });
            showToast('Порядок изменен', 'success');
            loadFiles();
        } catch (error) {
            showToast('Ошибка при изменении порядка', 'error');
            console.error('Error changing order:', error);
        }
    };

    return (
        <div className="file-manager">
            <h2>Управление файлами</h2>

            {/* Статистика */}
            <div className="file-stats">
                <h3>Статистика</h3>
                <div className="stats-grid">
                    {stats.map(stat => (
                        <div key={stat.fileType} className="stat-card">
                            <div className="stat-label">{getFileTypeLabel(stat.fileType)}</div>
                            <div className="stat-value">{stat.count} файлов</div>
                            <div className="stat-size">{formatFileSize(stat.totalSize)}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Форма загрузки */}
            <div className="upload-section">
                <h3>Загрузить новый файл</h3>
                <form onSubmit={handleUpload} className="upload-form">
                    <div className="form-group">
                        <label>Тип файла:</label>
                        <select 
                            value={uploadType} 
                            onChange={(e) => setUploadType(e.target.value)}
                            required
                        >
                            {uploadableTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Файл(ы):</label>
                        <input
                            id="file-input"
                            type="file"
                            onChange={handleFileSelect}
                            multiple={uploadType === 'gallery' || uploadType === 'sponsors'}
                            required
                        />
                        {uploadFiles.length > 0 && (
                            <small style={{ color: '#666', marginTop: '5px' }}>
                                Выбрано файлов: {uploadFiles.length}
                            </small>
                        )}
                    </div>

                    {uploadType === 'regulations' && (
                        <div className="form-group">
                            <label>Тип документа:</label>
                            <select 
                                value={uploadSubType} 
                                onChange={(e) => setUploadSubType(e.target.value)}
                            >
                                <option value="">Выберите тип</option>
                                <option value="consent_minor">Согласие несовершеннолетнего</option>
                                <option value="consent_adult">Согласие совершеннолетнего</option>
                                <option value="regulations">Положение</option>
                                <option value="booklet">Памятка</option>
                                <option value="essay_requirements">Требования к эссе</option>
                            </select>
                        </div>
                    )}

                    {(uploadType === 'tasks' || uploadType === 'gallery') && (
                        <div className="form-group">
                            <label>Год:</label>
                            <input
                                type="number"
                                value={uploadYear}
                                onChange={(e) => setUploadYear(parseInt(e.target.value))}
                                min="2020"
                                max="2030"
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Описание (необязательно):</label>
                        <textarea
                            value={uploadDescription}
                            onChange={(e) => setUploadDescription(e.target.value)}
                            placeholder="Добавьте описание файла..."
                            rows="3"
                        />
                    </div>

                    <button type="submit" disabled={uploading || uploadFiles.length === 0}>
                        {uploading 
                            ? `Загрузка ${uploadProgress.current}/${uploadProgress.total}...` 
                            : `Загрузить ${uploadFiles.length > 0 ? `(${uploadFiles.length})` : ''}`
                        }
                    </button>
                    
                    {uploading && uploadProgress.total > 0 && (
                        <div className="upload-progress">
                            <div 
                                className="upload-progress-bar" 
                                style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                            ></div>
                        </div>
                    )}
                </form>
            </div>

            {/* Вкладки */}
            <div className="tabs-section">
                {fileTypes.map(type => (
                    <button
                        key={type.value}
                        className={`tab ${selectedType === type.value ? 'active' : ''}`}
                        onClick={() => setSelectedType(type.value)}
                    >
                        {type.label}
                        {type.value === 'backups' && (
                            <span className="tab-count">{backups.length}</span>
                        )}
                        {type.value && type.value !== 'backups' && stats.find(s => s.fileType === type.value) && (
                            <span className="tab-count">
                                {stats.find(s => s.fileType === type.value).count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Список файлов или Бэкапы */}
            <div className="files-section">
                {selectedType === 'backups' ? (
                    <>
                        <div className="backups-header">
                            <h3>Бэкапы базы данных ({backups.length})</h3>
                            <p className="backups-info">Автоматические бэкапы создаются каждые 6 часов</p>
                            <button 
                                className="btn-create-backup" 
                                onClick={handleCreateBackup}
                                disabled={creatingBackup}
                            >
                                {creatingBackup ? 'Создание...' : 'Создать бэкап сейчас'}
                            </button>
                        </div>
                        {loadingBackups ? (
                            <div className="loading">Загрузка бэкапов...</div>
                        ) : backups.length === 0 ? (
                            <div className="no-files">
                                Нет бэкапов. Нажмите «Создать бэкап сейчас» или дождитесь автоматического создания (каждые 6 часов).
                            </div>
                        ) : (
                            <div className="backups-list">
                                {backups.map((backup) => (
                                    <div key={backup.filename} className="backup-card file-card">
                                        <div className="file-icon">🗄️</div>
                                        <div className="file-info">
                                            <div className="file-name" title={backup.filename}>{backup.filename}</div>
                                            <div className="file-size">{formatFileSize(backup.size)}</div>
                                            <div className="file-date">
                                                {new Date(backup.createdAt).toLocaleString('ru-RU')}
                                            </div>
                                        </div>
                                        <div className="file-actions">
                                            <button 
                                                onClick={() => handleDownloadBackup(backup.filename)}
                                                className="btn-view"
                                            >
                                                Скачать
                                            </button>
                                            <button 
                                                onClick={() => setConfirmDeleteBackup({ show: true, filename: backup.filename })}
                                                className="btn-delete"
                                            >
                                                Удалить
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                <div className="files-header">
                    <h3>Файлы ({files.length})</h3>
                    {selectedFiles.length > 0 && (
                        <div className="bulk-actions">
                            <span className="selected-count">Выбрано: {selectedFiles.length}</span>
                            <button 
                                className="btn-delete-selected"
                                onClick={() => setConfirmDialog({ show: true, fileId: 'bulk' })}
                            >
                                Удалить выбранные
                            </button>
                            <button 
                                className="btn-cancel-selection"
                                onClick={() => setSelectedFiles([])}
                            >
                                Отменить
                            </button>
                        </div>
                    )}
                </div>
                {loading ? (
                    <div className="loading">Загрузка...</div>
                ) : files.length === 0 ? (
                    <div className="no-files">Нет файлов</div>
                ) : (
                    <>
                        {files.length > 1 && (
                            <div className="select-all-container">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={selectedFiles.length === files.length}
                                        onChange={toggleSelectAll}
                                    />
                                    <span>Выбрать все</span>
                                </label>
                            </div>
                        )}
                        <div className="files-grid">
                        {files.map(file => (
                            <div key={file.id} className="file-card">
                                <div className="file-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={selectedFiles.includes(file.id)}
                                        onChange={() => toggleFileSelection(file.id)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                                {selectedType === 'gallery' && file.mimetype.startsWith('image/') ? (
                                    <div 
                                        className="file-icon clickable" 
                                        onClick={() => setPreviewFile(file)}
                                        title="Нажмите для просмотра"
                                    >
                                        🖼️
                                    </div>
                                ) : file.mimetype.startsWith('image/') && selectedType !== '' ? (
                                    <img 
                                        src={file.url} 
                                        alt={file.filename}
                                        className="file-preview"
                                    />
                                ) : file.mimetype.startsWith('image/') ? (
                                    <div 
                                        className="file-icon clickable" 
                                        onClick={() => setPreviewFile(file)}
                                        title="Нажмите для просмотра (галерея)"
                                    >
                                        🖼️
                                    </div>
                                ) : (
                                    <div className="file-icon">📄</div>
                                )}
                                
                                <div className="file-info">
                                    {editingFile === file.id ? (
                                        <>
                                            <input
                                                type="text"
                                                defaultValue={file.filename}
                                                onBlur={(e) => handleUpdate(file.id, { filename: e.target.value })}
                                            />
                                            <textarea
                                                defaultValue={file.description || ''}
                                                onBlur={(e) => handleUpdate(file.id, { description: e.target.value })}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <div className="file-name" title={file.filename}>
                                                {file.filename}
                                            </div>
                                            <div className="file-type">{getFileTypeLabel(file.fileType)}</div>
                                            
                                            {/* Специфичная информация для каждого типа */}
                                            <div className="file-metadata">
                                                {file.fileType === 'sponsors' && selectedType === 'sponsors' && (
                                                    <div className="order-input-group">
                                                        <label>Порядок:</label>
                                                        <input
                                                            key={`order-${file.id}-${file.displayOrder}`}
                                                            type="number"
                                                            defaultValue={file.displayOrder ?? 0}
                                                            onBlur={(e) => handleChangeOrder(file.id, e.target.value)}
                                                            className="order-input"
                                                            min="0"
                                                        />
                                                    </div>
                                                )}
                                                {file.fileType === 'regulations' && file.subType && (
                                                    <div className="metadata-badge subtype">
                                                        📋 {
                                                            file.subType === 'consent_minor' ? 'Согласие несов.' :
                                                            file.subType === 'consent_adult' ? 'Согласие сов.' :
                                                            file.subType === 'regulations' ? 'Положение' :
                                                            file.subType === 'booklet' ? 'Памятка' :
                                                            file.subType === 'essay_requirements' ? 'Требования к эссе' :
                                                            file.subType
                                                        }
                                                    </div>
                                                )}
                                                {file.fileType === 'tasks' && selectedType === 'tasks' && (
                                                    <>
                                                        {file.year && (
                                                            <div className="metadata-badge year">
                                                                📅 {file.year} год
                                                            </div>
                                                        )}
                                                        <div className="order-input-group">
                                                            <label>Порядок:</label>
                                                            <input
                                                                key={`order-${file.id}-${file.displayOrder}`}
                                                                type="number"
                                                                defaultValue={file.displayOrder ?? 0}
                                                                onBlur={(e) => handleChangeOrder(file.id, e.target.value)}
                                                                className="order-input"
                                                                min="0"
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                                {file.fileType === 'gallery' && selectedType === 'gallery' && file.year && (
                                                    <div className="metadata-badge year">
                                                        📅 {file.year} год
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="file-size">{formatFileSize(file.size)}</div>
                                            {file.description && (
                                                <div className="file-description">{file.description}</div>
                                            )}
                                            <div className="file-date">
                                                {new Date(file.createdAt).toLocaleDateString('ru-RU')}
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="file-actions">
                                    <a 
                                        href={file.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="btn-view"
                                    >
                                        Открыть
                                    </a>
                                    <button 
                                        onClick={() => setEditingFile(editingFile === file.id ? null : file.id)}
                                        className="btn-edit"
                                    >
                                        {editingFile === file.id ? 'Готово' : 'Изменить'}
                                    </button>
                                    <button 
                                        onClick={() => setConfirmDialog({ show: true, fileId: file.id })}
                                        className="btn-delete"
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    </>
                )}
                    </>
                )}
            </div>

            {/* Модальное окно для просмотра изображения */}
            {previewFile && (
                <div className="image-preview-modal" onClick={() => setPreviewFile(null)}>
                    <button 
                        className="preview-close"
                        onClick={() => setPreviewFile(null)}
                        aria-label="Закрыть"
                    >
                        ✕
                    </button>
                    <div className="preview-content" onClick={(e) => e.stopPropagation()}>
                        <img 
                            src={previewFile.url} 
                            alt={previewFile.filename}
                        />
                        <div className="preview-info">
                            <h4>{previewFile.filename}</h4>
                            {previewFile.description && <p>{previewFile.description}</p>}
                            <div className="preview-meta">
                                <span>{formatFileSize(previewFile.size)}</span>
                                {previewFile.year && <span>Год: {previewFile.year}</span>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}

            {confirmDialog.show && (
                <ConfirmDialog
                    isOpen={true}
                    title={confirmDialog.fileId === 'bulk' ? 'Удаление файлов' : 'Удаление файла'}
                    message={
                        confirmDialog.fileId === 'bulk' 
                            ? `Вы уверены, что хотите удалить ${selectedFiles.length} файлов? Это действие нельзя отменить.`
                            : 'Вы уверены, что хотите удалить этот файл? Это действие нельзя отменить.'
                    }
                    confirmText="Удалить"
                    cancelText="Отмена"
                    danger={true}
                    onConfirm={() => {
                        if (confirmDialog.fileId === 'bulk') {
                            handleDeleteSelected();
                        } else {
                            handleDelete(confirmDialog.fileId);
                            setConfirmDialog({ show: false, fileId: null });
                        }
                    }}
                    onCancel={() => setConfirmDialog({ show: false, fileId: null })}
                />
            )}

            {confirmDeleteBackup.show && (
                <ConfirmDialog
                    isOpen={true}
                    title="Удаление бэкапа"
                    message={`Удалить бэкап ${confirmDeleteBackup.filename}?`}
                    confirmText="Удалить"
                    cancelText="Отмена"
                    danger={true}
                    onConfirm={() => handleDeleteBackup(confirmDeleteBackup.filename)}
                    onCancel={() => setConfirmDeleteBackup({ show: false, filename: null })}
                />
            )}
        </div>
    );
};

export default FileManager;
