import React, { useState, useEffect } from 'react';
import VolunteerService from '../../services/VolunteerService';
import Toast from '../../components/Toast';

const Volunteers = () => {
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ type: null, message: '' });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [selectedVolunteer, setSelectedVolunteer] = useState(null);
    const [showInfoModal, setShowInfoModal] = useState(false);
    
    // Форма создания волонтера
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        secondName: ''
    });

    // Форма смены пароля
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        loadVolunteers();
    }, []);

    const loadVolunteers = async () => {
        try {
            setLoading(true);
            const response = await VolunteerService.getVolunteers();
            setVolunteers(response.data.data);
        } catch (e) {
            setNotification({ 
                type: 'error', 
                message: e.response?.data?.message || 'Ошибка загрузки волонтеров' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateVolunteer = async (e) => {
        e.preventDefault();
        
        if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
            setNotification({ type: 'error', message: 'Заполните все обязательные поля' });
            return;
        }

        if (formData.password.length < 6) {
            setNotification({ type: 'error', message: 'Пароль должен быть не менее 6 символов' });
            return;
        }

        try {
            await VolunteerService.createVolunteer(
                formData.email,
                formData.password,
                formData.firstName,
                formData.lastName,
                formData.secondName
            );
            
            setNotification({ type: 'success', message: 'Волонтер успешно создан' });
            setShowCreateModal(false);
            setFormData({
                email: '',
                password: '',
                firstName: '',
                lastName: '',
                secondName: ''
            });
            loadVolunteers();
        } catch (e) {
            setNotification({ 
                type: 'error', 
                message: e.response?.data?.message || 'Ошибка создания волонтера' 
            });
        }
    };

    const handleDeleteVolunteer = async (volunteerId, volunteerName) => {
        if (!window.confirm(`Вы уверены, что хотите удалить волонтера ${volunteerName}?`)) {
            return;
        }

        try {
            await VolunteerService.deleteVolunteer(volunteerId);
            setNotification({ type: 'success', message: 'Волонтер успешно удален' });
            loadVolunteers();
        } catch (e) {
            setNotification({ 
                type: 'error', 
                message: e.response?.data?.message || 'Ошибка удаления волонтера' 
            });
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();

        if (!newPassword || !confirmPassword) {
            setNotification({ type: 'error', message: 'Заполните все поля' });
            return;
        }

        if (newPassword.length < 6) {
            setNotification({ type: 'error', message: 'Пароль должен быть не менее 6 символов' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setNotification({ type: 'error', message: 'Пароли не совпадают' });
            return;
        }

        try {
            await VolunteerService.updateVolunteerPassword(selectedVolunteer.id, newPassword);
            setNotification({ type: 'success', message: 'Пароль успешно обновлен' });
            setShowPasswordModal(false);
            setSelectedVolunteer(null);
            setNewPassword('');
            setConfirmPassword('');
        } catch (e) {
            setNotification({ 
                type: 'error', 
                message: e.response?.data?.message || 'Ошибка обновления пароля' 
            });
        }
    };

    const openPasswordModal = (volunteer) => {
        setSelectedVolunteer(volunteer);
        setShowPasswordModal(true);
        setNewPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Волонтеры</h1>
                    <p className="admin-page-subtitle">Управление аккаунтами волонтеров</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <button
                        onClick={() => setShowInfoModal(true)}
                        style={{
                            width: '32px',
                            height: '32px',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            border: '1px solid #e2e8f0',
                            background: 'white',
                            color: '#64748b',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#cbd5e1';
                            e.currentTarget.style.color = '#475569';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e2e8f0';
                            e.currentTarget.style.color = '#64748b';
                        }}
                        title="Информация"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="16" x2="12" y2="12"/>
                            <line x1="12" y1="8" x2="12.01" y2="8"/>
                        </svg>
                    </button>
                    <button 
                        className="btn btn-primary btn-with-icon"
                        onClick={() => setShowCreateModal(true)}
                    >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="8.5" cy="7" r="4"/>
                        <line x1="20" y1="8" x2="20" y2="14"/>
                        <line x1="23" y1="11" x2="17" y2="11"/>
                    </svg>
                    Создать волонтера
                </button>
                </div>
            </div>

            {loading ? (
                <div className="loading">Загрузка...</div>
            ) : volunteers.length === 0 ? (
                <div className="admin-placeholder">
                    <div className="admin-placeholder-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                    </div>
                    <h2>Волонтеры не найдены</h2>
                    <p>Создайте первого волонтера для отметки посещаемости</p>
                    <button 
                        className="btn btn-primary"
                        onClick={() => setShowCreateModal(true)}
                        style={{ marginTop: 'var(--spacing-lg)' }}
                    >
                        Создать волонтера
                    </button>
                </div>
            ) : (
                <div className="admin-section">
                    <div className="volunteers-table-container">
                        <table className="participants-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>ФИО</th>
                                    <th>Email</th>
                                    <th style={{ width: '200px', textAlign: 'center' }}>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {volunteers.map((volunteer) => (
                                    <tr key={volunteer.id}>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                            #{volunteer.id}
                                        </td>
                                        <td>
                                            <div className="participant-name">
                                                {volunteer.fullName}
                                            </div>
                                        </td>
                                        <td>{volunteer.email}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                <button
                                                    className="btn btn-sm btn-outline"
                                                    onClick={() => openPasswordModal(volunteer)}
                                                    title="Сменить пароль"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                                    </svg>
                                                    Пароль
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline"
                                                    onClick={() => handleDeleteVolunteer(volunteer.id, volunteer.fullName)}
                                                    style={{ color: '#dc2626', borderColor: '#dc2626' }}
                                                    title="Удалить"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="3 6 5 6 21 6"/>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                                    </svg>
                                                    Удалить
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Модальное окно создания волонтера */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', padding: 'var(--spacing-xl)' }}>
                        <div className="modal-header" style={{ marginBottom: 'var(--spacing-lg)' }}>
                            <h2 style={{ margin: 0 }}>Создать волонтера</h2>
                            <button 
                                className="modal-close"
                                onClick={() => setShowCreateModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleCreateVolunteer}>
                            <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
                                <label className="form-label">Email *</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="volunteer@example.com"
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
                                <label className="form-label">Пароль *</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Минимум 6 символов"
                                    minLength="6"
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
                                <label className="form-label">Имя *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    placeholder="Иван"
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
                                <label className="form-label">Фамилия *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    placeholder="Иванов"
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 'var(--spacing-lg)' }}>
                                <label className="form-label">Отчество</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.secondName}
                                    onChange={(e) => setFormData({ ...formData, secondName: e.target.value })}
                                    placeholder="Иванович (необязательно)"
                                />
                            </div>
                            <div className="modal-footer" style={{ marginTop: 'var(--spacing-lg)', paddingTop: 'var(--spacing-lg)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button 
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Отмена
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Создать
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Модальное окно смены пароля */}
            {showPasswordModal && selectedVolunteer && (
                <div className="modal-overlay">
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', padding: 'var(--spacing-xl)' }}>
                        <div className="modal-header" style={{ marginBottom: 'var(--spacing-lg)' }}>
                            <h2 style={{ margin: 0 }}>Сменить пароль</h2>
                            <button 
                                className="modal-close"
                                onClick={() => setShowPasswordModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <p style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--text-secondary)' }}>
                            Волонтер: <strong>{selectedVolunteer.fullName}</strong>
                        </p>
                        <form onSubmit={handleUpdatePassword}>
                            <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
                                <label className="form-label">Новый пароль *</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Минимум 6 символов"
                                    minLength="6"
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 'var(--spacing-lg)' }}>
                                <label className="form-label">Подтвердите пароль *</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Повторите пароль"
                                    minLength="6"
                                    required
                                />
                            </div>
                            <div className="modal-footer" style={{ marginTop: 'var(--spacing-lg)', paddingTop: 'var(--spacing-lg)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button 
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => setShowPasswordModal(false)}
                                >
                                    Отмена
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Обновить пароль
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Модальное окно с инструкцией */}
            {showInfoModal && (
                <div className="modal-overlay" onClick={() => setShowInfoModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
                        <div className="modal-header" style={{ marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>Полезные советы</h2>
                            <button 
                                className="modal-close"
                                onClick={() => setShowInfoModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div style={{ lineHeight: '1.8' }}>
                            <ul style={{ marginLeft: '1.5rem', color: '#475569', lineHeight: '1.8' }}>
                                <li>Создавайте аккаунты волонтеров перед началом чемпионата</li>
                                <li>Используйте надежные пароли при создании аккаунтов волонтеров</li>
                                <li>Волонтеры могут работать одновременно – система обрабатывает конфликты автоматически</li>
                                <li>При необходимости можно изменить пароль волонтера через кнопку "Пароль"</li>
                                <li>Удаление волонтера необратимо – убедитесь перед удалением</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast уведомление */}
            {notification.type && (
                <Toast
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification({ type: null, message: '' })}
                    duration={5000}
                />
            )}
        </div>
    );
};

export default Volunteers;

