import React, { useState, useEffect } from 'react';
import SettingsService from '../../services/SettingsService';
import Toast from '../../components/Toast';
import ConfirmDialog from '../../components/ConfirmDialog';

const Settings = () => {
    const [settings, setSettings] = useState({
        registration_start: '',
        registration_end: '',
        championship_datetime: '',
        essay_close_date: ''
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState({ type: null, message: '' });
    const [showClearDialog, setShowClearDialog] = useState(false);
    const [clearing, setClearing] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const response = await SettingsService.getSettings();
            const data = response.data.data;
            
            const formatDateForInput = (dateString) => {
                if (!dateString) return '';
                const date = new Date(dateString);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            const formatDateTimeForInput = (dateString) => {
                if (!dateString) return '';
                const date = new Date(dateString);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                return `${year}-${month}-${day}T${hours}:${minutes}`;
            };
            
            setSettings({
                registration_start: formatDateForInput(data.registration_start),
                registration_end: formatDateForInput(data.registration_end),
                championship_datetime: formatDateTimeForInput(data.championship_datetime),
                essay_close_date: formatDateForInput(data.essay_close_date)
            });
        } catch (e) {
            setNotification({ 
                type: 'error', 
                message: e.response?.data?.message || 'Ошибка загрузки настроек' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (saving) return;

        // Валидация
        if (settings.registration_start && settings.registration_end) {
            const startDate = new Date(settings.registration_start);
            const endDate = new Date(settings.registration_end);
            
            if (startDate >= endDate) {
                setNotification({ 
                    type: 'error', 
                    message: 'Дата начала регистрации должна быть раньше даты окончания' 
                });
                return;
            }
        }

        try {
            setSaving(true);
            setNotification({ type: null, message: '' });

            // Преобразуем даты из локального времени браузера в ISO формат (UTC) для отправки на сервер
            // datetime-local возвращает время в локальном часовом поясе браузера
            // new Date("YYYY-MM-DDTHH:mm") интерпретирует строку как локальное время
            // toISOString() конвертирует в UTC
            const convertToISO = (dateTimeLocal) => {
                if (!dateTimeLocal) return null;
                // Создаем дату из локального времени браузера
                // Например, если пользователь в UTC+5 вводит "2024-01-01T18:15",
                // то new Date() создаст дату 18:15 в UTC+5, что равно 13:15 UTC
                const date = new Date(dateTimeLocal);
                // Конвертируем в ISO строку (UTC) для сохранения на сервере
                return date.toISOString();
            };

            const dataToSend = {
                registration_start: settings.registration_start || null,
                registration_end: settings.registration_end || null,
                championship_datetime: convertToISO(settings.championship_datetime),
                essay_close_date: settings.essay_close_date || null
            };

            await SettingsService.updateSettings(dataToSend);
            
            setNotification({ 
                type: 'success', 
                message: 'Настройки успешно сохранены' 
            });
        } catch (e) {
            setNotification({ 
                type: 'error', 
                message: e.response?.data?.message || 'Ошибка сохранения настроек' 
            });
        } finally {
            setSaving(false);
        }
    };

    const handleClear = () => {
        setSettings(prev => ({
            ...prev,
            registration_start: '',
            registration_end: '',
            championship_datetime: '',
            essay_close_date: ''
        }));
    };

    const getRegistrationStatus = () => {
        if (!settings.registration_start || !settings.registration_end) {
            return { status: 'closed', text: 'Регистрация закрыта (даты не установлены)' };
        }

        const now = new Date();
        const startDate = new Date(settings.registration_start);
        const endDate = new Date(settings.registration_end);

        if (now < startDate) {
            return { 
                status: 'not_started', 
                text: `Регистрация начнется ${startDate.toLocaleString('ru-RU')}` 
            };
        }

        if (now > endDate) {
            return { 
                status: 'closed', 
                text: `Регистрация закрыта (закончилась ${endDate.toLocaleString('ru-RU')})` 
            };
        }

        return { status: 'open', text: 'Регистрация открыта' };
    };

    const handleClearData = async () => {
        try {
            setClearing(true);
            setNotification({ type: null, message: '' });
            
            const response = await SettingsService.clearDataForNewYear();
            
            setNotification({ 
                type: 'success', 
                message: response.data.message || 'Данные успешно очищены' 
            });
            
            setShowClearDialog(false);
        } catch (e) {
            setNotification({ 
                type: 'error', 
                message: e.response?.data?.message || 'Ошибка при очистке данных' 
            });
        } finally {
            setClearing(false);
        }
    };

    const status = getRegistrationStatus();

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Настройки</h1>
                    <p className="admin-page-subtitle">Управление системой и регистрацией</p>
                </div>
            </div>

            {loading ? (
                <div className="admin-placeholder">
                    <div className="spinner"></div>
                    <p>Загрузка настроек...</p>
                </div>
            ) : (
                <div className="admin-content">
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <h2 className="admin-card-title">Настройки регистрации</h2>
                        </div>
                        <div className="admin-card-body">
                            <div className="settings-status" style={{ 
                                marginBottom: 'var(--spacing-xl)',
                                padding: 'var(--spacing-md)',
                                borderRadius: 'var(--border-radius-md)',
                                backgroundColor: status.status === 'open' 
                                    ? 'var(--success-light)' 
                                    : status.status === 'closed' 
                                        ? 'var(--error-light)' 
                                        : 'var(--warning-light)',
                                border: `1px solid ${status.status === 'open' 
                                    ? 'var(--success-color)' 
                                    : status.status === 'closed' 
                                        ? 'var(--error-color)' 
                                        : 'var(--warning-color)'}`
                            }}>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 'var(--spacing-sm)' 
                                }}>
                                    <span style={{
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '50%',
                                        backgroundColor: status.status === 'open' 
                                            ? 'var(--success-color)' 
                                            : status.status === 'closed' 
                                                ? 'var(--error-color)' 
                                                : 'var(--warning-color)'
                                    }}></span>
                                    <strong>{status.text}</strong>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label className="form-label">
                                        Дата начала регистрации <span style={{ color: 'red' }}>*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="registration_start"
                                        value={settings.registration_start}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="Не установлено"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        Дата окончания регистрации <span style={{ color: 'red' }}>*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="registration_end"
                                        value={settings.registration_end}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="Не установлено"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        Дата и время проведения чемпионата
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="championship_datetime"
                                        value={settings.championship_datetime}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="Не установлено"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        Дата закрытия эссе
                                    </label>
                                    <input
                                        type="date"
                                        name="essay_close_date"
                                        value={settings.essay_close_date}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="Не установлено"
                                    />
                                </div>

                                <div className="form-actions" style={{ 
                                    display: 'flex', 
                                    gap: 'var(--spacing-md)', 
                                    marginTop: 'var(--spacing-xl)' 
                                }}>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={saving}
                                    >
                                        {saving ? 'Сохранение...' : 'Сохранить настройки'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleClear}
                                        disabled={saving}
                                    >
                                        Очистить все
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="admin-card" style={{ 
                        marginTop: 'var(--spacing-xl)',
                        border: '2px solid rgba(239, 68, 68, 0.2)',
                        background: 'linear-gradient(135deg, rgba(254, 242, 242, 0.95), rgba(255, 255, 255, 0.85))'
                    }}>
                        <div className="admin-card-header" style={{ 
                            borderBottom: '2px solid rgba(239, 68, 68, 0.2)',
                            paddingBottom: 'var(--spacing-md)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                                }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                                        <polyline points="3 6 5 6 21 6"/>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                        <line x1="10" y1="11" x2="10" y2="17"/>
                                        <line x1="14" y1="11" x2="14" y2="17"/>
                                    </svg>
                                </div>
                                <h2 className="admin-card-title" style={{ margin: 0, color: '#dc2626' }}>
                                    Очистка данных для нового года
                                </h2>
                            </div>
                        </div>
                        <div className="admin-card-body">
                            <div style={{ 
                                padding: 'var(--spacing-lg)',
                                borderRadius: 'var(--border-radius-md)',
                                background: 'rgba(254, 242, 242, 0.5)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                marginBottom: 'var(--spacing-lg)'
                            }}>
                                <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'flex-start' }}>
                                    <div style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        background: '#ef4444',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        marginTop: '2px'
                                    }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                            <path d="M12 2v20M12 2l-8 8M12 2l8 8"/>
                                        </svg>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ 
                                            margin: '0 0 var(--spacing-sm) 0', 
                                            color: '#991b1b',
                                            fontWeight: '600',
                                            fontSize: 'var(--font-size-base)'
                                        }}>
                                            Внимание! Опасная операция
                                        </p>
                                        <p style={{ 
                                            margin: 0, 
                                            color: 'var(--text-primary)',
                                            lineHeight: '1.6',
                                            fontSize: 'var(--font-size-sm)'
                                        }}>
                                            Эта операция удалит все данные участников, команды и рассадку. 
                                            Школы, файлы и результаты чемпионата не будут затронуты. Это действие нельзя отменить.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={() => setShowClearDialog(true)}
                                disabled={clearing}
                                style={{
                                    width: '100%',
                                    padding: 'var(--spacing-md) var(--spacing-lg)',
                                    fontSize: 'var(--font-size-base)',
                                    fontWeight: '600'
                                }}
                            >
                                {clearing ? (
                                    <>
                                        <span className="spinner" style={{ 
                                            width: '16px', 
                                            height: '16px', 
                                            borderWidth: '2px',
                                            marginRight: 'var(--spacing-sm)'
                                        }}></span>
                                        Очистка...
                                    </>
                                ) : (
                                    <>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 'var(--spacing-sm)' }}>
                                            <polyline points="3 6 5 6 21 6"/>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                        </svg>
                                        Очистить данные для нового года
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {notification.type && (
                <Toast
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification({ type: null, message: '' })}
                />
            )}

            {showClearDialog && (
                <ConfirmDialog
                    isOpen={true}
                    title="Очистка данных для нового года"
                    message={
                        <div>
                            <p style={{ marginBottom: 'var(--spacing-md)' }}>
                                Вы уверены, что хотите очистить все данные? Это действие удалит:
                            </p>
                            <ul style={{ 
                                marginLeft: 'var(--spacing-lg)', 
                                marginBottom: 'var(--spacing-md)',
                                lineHeight: '1.8'
                            }}>
                                <li>Всех участников (кроме администраторов)</li>
                                <li>Все команды</li>
                                <li>Всю рассадку</li>
                                <li>Все токены</li>
                            </ul>
                            <p style={{ 
                                marginTop: 'var(--spacing-md)',
                                fontWeight: 'bold',
                                color: 'var(--error-color)'
                            }}>
                                Школы, файлы и результаты чемпионата не будут затронуты. Это действие нельзя отменить!
                            </p>
                        </div>
                    }
                    confirmText="Да, очистить"
                    cancelText="Отмена"
                    danger={true}
                    onConfirm={handleClearData}
                    onCancel={() => setShowClearDialog(false)}
                />
            )}
        </div>
    );
};

export default Settings;
