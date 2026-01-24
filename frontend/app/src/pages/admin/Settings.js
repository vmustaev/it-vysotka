import React, { useState, useEffect } from 'react';
import SettingsService from '../../services/SettingsService';
import Toast from '../../components/Toast';

const Settings = () => {
    const [settings, setSettings] = useState({
        registration_start: '',
        registration_end: '',
        championship_datetime: ''
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState({ type: null, message: '' });

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
                championship_datetime: formatDateTimeForInput(data.championship_datetime)
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
                championship_datetime: convertToISO(settings.championship_datetime)
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
            championship_datetime: ''
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
                </div>
            )}

            {notification.type && (
                <Toast
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification({ type: null, message: '' })}
                />
            )}
        </div>
    );
};

export default Settings;
