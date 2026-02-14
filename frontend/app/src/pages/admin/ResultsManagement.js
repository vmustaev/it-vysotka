import React, { useState, useEffect } from 'react';
import ResultsService from '../../services/ResultsService';
import Toast from '../../components/Toast';
import ConfirmDialog from '../../components/ConfirmDialog';

const ResultsManagement = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ type: null, message: '' });
    const [showModal, setShowModal] = useState(false);
    const [editingResult, setEditingResult] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ show: false, resultId: null });
    const [showAutoGenerateModal, setShowAutoGenerateModal] = useState(false);
    const [autoGenerateYear, setAutoGenerateYear] = useState(new Date().getFullYear());
    const [generatingFromParticipants, setGeneratingFromParticipants] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [sendingWinnerNotifications, setSendingWinnerNotifications] = useState(false);
    const [formData, setFormData] = useState({
        year: new Date().getFullYear(),
        place: 1,
        participants: '',
        schools: '',
        cities: ''
    });

    useEffect(() => {
        loadResults();
    }, []);

    const loadResults = async () => {
        try {
            setLoading(true);
            const response = await ResultsService.getAllResults();
            setResults(response.data.data);
        } catch (e) {
            setNotification({ 
                type: 'error', 
                message: e.response?.data?.message || 'Ошибка загрузки результатов' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'year' || name === 'place' ? parseInt(value) || '' : value
        }));
    };

    const handleOpenModal = (result = null) => {
        if (result) {
            setEditingResult(result);
            setFormData({
                year: result.year,
                place: result.place,
                participants: result.participants,
                schools: result.schools,
                cities: result.cities
            });
        } else {
            setEditingResult(null);
            setFormData({
                year: new Date().getFullYear(),
                place: 1,
                participants: '',
                schools: '',
                cities: ''
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingResult(null);
        setFormData({
            year: new Date().getFullYear(),
            place: 1,
            participants: '',
            schools: '',
            cities: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.year || !formData.place || !formData.participants || !formData.schools || !formData.cities) {
            setNotification({ 
                type: 'error', 
                message: 'Все поля обязательны для заполнения' 
            });
            return;
        }

        try {
            setNotification({ type: null, message: '' });
            
            if (editingResult) {
                await ResultsService.updateResult(editingResult.id, formData);
                setNotification({ 
                    type: 'success', 
                    message: 'Результат успешно обновлен' 
                });
            } else {
                await ResultsService.createResult(formData);
                setNotification({ 
                    type: 'success', 
                    message: 'Результат успешно создан' 
                });
            }
            
            handleCloseModal();
            loadResults();
        } catch (e) {
            setNotification({ 
                type: 'error', 
                message: e.response?.data?.message || 'Ошибка сохранения результата' 
            });
        }
    };

    const handleDeleteClick = (id) => {
        setConfirmDialog({ show: true, resultId: id });
    };

    const handleDelete = async () => {
        const id = confirmDialog.resultId;
        try {
            await ResultsService.deleteResult(id);
            setNotification({ 
                type: 'success', 
                message: 'Результат успешно удален' 
            });
            setConfirmDialog({ show: false, resultId: null });
            loadResults();
        } catch (e) {
            setNotification({ 
                type: 'error', 
                message: e.response?.data?.message || 'Ошибка удаления результата' 
            });
            setConfirmDialog({ show: false, resultId: null });
        }
    };

    const handleOpenAutoGenerateModal = () => {
        setAutoGenerateYear(new Date().getFullYear());
        setShowAutoGenerateModal(true);
    };

    const handleCloseAutoGenerateModal = () => {
        setShowAutoGenerateModal(false);
        setAutoGenerateYear(new Date().getFullYear());
    };

    const handleAutoGenerateFromParticipants = async () => {
        try {
            setGeneratingFromParticipants(true);
            setNotification({ type: null, message: '' });

            const response = await ResultsService.createResultsFromParticipants(autoGenerateYear);
            
            setNotification({ 
                type: 'success', 
                message: response.data.message || 'Результаты успешно созданы' 
            });
            
            handleCloseAutoGenerateModal();
            loadResults();
        } catch (e) {
            setNotification({ 
                type: 'error', 
                message: e.response?.data?.message || 'Ошибка автоматического создания результатов' 
            });
        } finally {
            setGeneratingFromParticipants(false);
        }
    };

    const handleSendWinnerNotifications = async () => {
        try {
            setSendingWinnerNotifications(true);
            setNotification({ type: null, message: '' });

            const response = await ResultsService.sendWinnerNotifications();
            
            setNotification({ 
                type: 'success', 
                message: response.data.message || 'Письма победителям успешно отправлены' 
            });
        } catch (e) {
            setNotification({ 
                type: 'error', 
                message: e.response?.data?.message || 'Ошибка отправки писем победителям' 
            });
        } finally {
            setSendingWinnerNotifications(false);
        }
    };

    const getPlaceName = (place) => {
        const placeNames = {
            1: 'Первое место',
            2: 'Второе место',
            3: 'Третье место'
        };
        return placeNames[place] || `${place}-е место`;
    };

    const getPlaceClass = (place) => {
        if (place === 1) return 'winner-gold';
        if (place === 2) return 'winner-silver';
        if (place === 3) return 'winner-bronze';
        return '';
    };

    // Группируем результаты по годам
    const resultsByYear = results.reduce((acc, result) => {
        if (!acc[result.year]) {
            acc[result.year] = [];
        }
        acc[result.year].push(result);
        return acc;
    }, {});

    const sortedYears = Object.keys(resultsByYear).sort((a, b) => parseInt(b) - parseInt(a));

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Результаты чемпионата</h1>
                    <p className="admin-page-subtitle">Управление результатами по годам</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
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
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                        className="btn btn-secondary btn-with-icon"
                        onClick={handleSendWinnerNotifications}
                        disabled={sendingWinnerNotifications}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16v13H5.17L4 18.17z"/>
                            <polyline points="22 6 12 13 2 6"/>
                        </svg>
                        {sendingWinnerNotifications ? 'Отправка...' : 'Отправить письма победителям'}
                    </button>
                    <button
                        className="btn btn-secondary btn-with-icon"
                        onClick={handleOpenAutoGenerateModal}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                        </svg>
                        Создать из участников
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => handleOpenModal()}
                    >
                        + Добавить результат
                    </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="admin-placeholder">
                    <div className="spinner"></div>
                    <p>Загрузка результатов...</p>
                </div>
            ) : (
                <div className="admin-content">
                    {results.length === 0 ? (
                        <div className="admin-card">
                            <div className="admin-card-body" style={{ textAlign: 'center', padding: 'var(--spacing-xxl)' }}>
                                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-lg)' }}>
                                    Результаты пока не добавлены
                                </p>
                            </div>
                        </div>
                    ) : (
                        sortedYears.map(year => (
                            <div key={year} className="admin-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                                <div className="admin-card-header">
                                    <h2 className="admin-card-title">{year} год</h2>
                                </div>
                                <div className="admin-card-body">
                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
                                        gap: 'var(--spacing-lg)' 
                                    }}>
                                        {resultsByYear[year]
                                            .sort((a, b) => a.place - b.place)
                                            .map(result => (
                                                <div 
                                                    key={result.id} 
                                                    className={`winner-card ${getPlaceClass(result.place)}`}
                                                    style={{ 
                                                        position: 'relative',
                                                        padding: 'var(--spacing-lg)',
                                                        marginBottom: 0
                                                    }}
                                                >
                                                    <div className="medal-badge" style={{
                                                        background: result.place === 1 
                                                            ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                                                            : result.place === 2
                                                                ? 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)'
                                                                : 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)'
                                                    }}>
                                                        <span className="medal-icon">{result.place}</span>
                                                    </div>
                                                    <h3 className="winner-place">{getPlaceName(result.place)}</h3>
                                                    <div className="winner-info">
                                                        <div className="info-row">
                                                            <span className="info-label">Участники:</span>
                                                            <p className="info-text">{result.participants}</p>
                                                        </div>
                                                        <div className="info-row">
                                                            <span className="info-label">Учебное заведение:</span>
                                                            <p className="info-text">{result.schools}</p>
                                                        </div>
                                                        <div className="info-row">
                                                            <span className="info-label">Город:</span>
                                                            <p className="info-text">{result.cities}</p>
                                                        </div>
                                                    </div>
                                                    <div style={{ 
                                                        marginTop: 'var(--spacing-md)',
                                                        display: 'flex',
                                                        gap: 'var(--spacing-sm)'
                                                    }}>
                                                        <button
                                                            className="btn btn-secondary"
                                                            style={{ fontSize: 'var(--font-size-sm)', padding: 'var(--spacing-xs) var(--spacing-sm)' }}
                                                            onClick={() => handleOpenModal(result)}
                                                        >
                                                            Редактировать
                                                        </button>
                                                        <button
                                                            className="btn btn-danger"
                                                            style={{ fontSize: 'var(--font-size-sm)', padding: 'var(--spacing-xs) var(--spacing-sm)' }}
                                                            onClick={() => handleDeleteClick(result.id)}
                                                        >
                                                            Удалить
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {editingResult ? 'Редактировать результат' : 'Добавить результат'}
                            </h2>
                            <button className="modal-close" onClick={handleCloseModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-body">
                            <div className="form-group">
                                <label className="form-label">
                                    Год <span style={{ color: 'red' }}>*</span>
                                </label>
                                <input
                                    type="number"
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                    className="form-input"
                                    min="2000"
                                    max="2100"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Место <span style={{ color: 'red' }}>*</span>
                                </label>
                                <input
                                    type="number"
                                    name="place"
                                    value={formData.place}
                                    onChange={handleChange}
                                    className="form-input"
                                    min="1"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Участники <span style={{ color: 'red' }}>*</span>
                                </label>
                                <textarea
                                    name="participants"
                                    value={formData.participants}
                                    onChange={handleChange}
                                    className="form-input"
                                    rows="3"
                                    placeholder="Список участников через запятую"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Учебные заведения <span style={{ color: 'red' }}>*</span>
                                </label>
                                <textarea
                                    name="schools"
                                    value={formData.schools}
                                    onChange={handleChange}
                                    className="form-input"
                                    rows="2"
                                    placeholder="Список учебных заведений через запятую"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Города <span style={{ color: 'red' }}>*</span>
                                </label>
                                <textarea
                                    name="cities"
                                    value={formData.cities}
                                    onChange={handleChange}
                                    className="form-input"
                                    rows="2"
                                    placeholder="Список городов через запятую"
                                    required
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
                                >
                                    {editingResult ? 'Сохранить изменения' : 'Создать результат'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleCloseModal}
                                >
                                    Отмена
                                </button>
                            </div>
                        </form>
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

            {showAutoGenerateModal && (
                <div className="modal-overlay" onClick={handleCloseAutoGenerateModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Создать результаты из участников</h2>
                            <button className="modal-close" onClick={handleCloseAutoGenerateModal}>×</button>
                        </div>
                        <div className="modal-body">
                            <p style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--text-secondary)' }}>
                                Система автоматически создаст результаты на основе участников с расставленными местами. 
                                Будут созданы записи для каждого призового места (1, 2, 3) с информацией об участниках, школах и городах.
                            </p>
                            
                            <div className="form-group">
                                <label className="form-label">
                                    Год чемпионата <span style={{ color: 'red' }}>*</span>
                                </label>
                                <input
                                    type="number"
                                    value={autoGenerateYear}
                                    onChange={(e) => setAutoGenerateYear(parseInt(e.target.value) || new Date().getFullYear())}
                                    className="form-input"
                                    min="2000"
                                    max="2100"
                                    required
                                />
                                <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: 'var(--spacing-xs)' }}>
                                    Укажите год, за который создаются результаты
                                </small>
                            </div>

                            <div style={{ 
                                background: 'var(--bg-secondary)', 
                                padding: 'var(--spacing-md)', 
                                borderRadius: 'var(--border-radius-md)',
                                marginTop: 'var(--spacing-lg)'
                            }}>
                                <h4 style={{ marginBottom: 'var(--spacing-sm)', fontSize: 'var(--font-size-md)' }}>
                                    ⚠️ Внимание
                                </h4>
                                <ul style={{ marginLeft: 'var(--spacing-lg)', color: 'var(--text-secondary)' }}>
                                    <li>Убедитесь, что места расставлены всем призерам во вкладке "Участники"</li>
                                    <li>Если результаты для указанного года и места уже существуют, они будут пропущены</li>
                                    <li>Данные берутся из профилей участников (ФИО, школа, город)</li>
                                </ul>
                            </div>

                            <div className="form-actions" style={{ 
                                display: 'flex', 
                                gap: 'var(--spacing-md)', 
                                marginTop: 'var(--spacing-xl)' 
                            }}>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleAutoGenerateFromParticipants}
                                    disabled={generatingFromParticipants}
                                >
                                    {generatingFromParticipants ? 'Создание...' : 'Создать результаты'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleCloseAutoGenerateModal}
                                    disabled={generatingFromParticipants}
                                >
                                    Отмена
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {confirmDialog.show && (
                <ConfirmDialog
                    isOpen={true}
                    title="Удаление результата"
                    message="Вы уверены, что хотите удалить этот результат? Это действие нельзя отменить."
                    confirmText="Удалить"
                    cancelText="Отмена"
                    danger={true}
                    onConfirm={handleDelete}
                    onCancel={() => setConfirmDialog({ show: false, resultId: null })}
                />
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
                                <li>Используйте фильтры для быстрого поиска результатов по участнику, команде или месту</li>
                                <li>Результаты можно добавлять вручную или импортировать из Excel файла</li>
                                <li>Места распределяются автоматически при добавлении результатов</li>
                                <li>Экспорт результатов позволяет сохранить полную таблицу результатов</li>
                                <li>Удаление результата необратимо – убедитесь перед удалением</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResultsManagement;

