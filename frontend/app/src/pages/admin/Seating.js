import React, { useState, useEffect } from 'react';
import SeatingService from '../../services/SeatingService';
import ConfirmDialog from '../../components/ConfirmDialog';

const Seating = () => {
    const [seating, setSeating] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [autoAssigning, setAutoAssigning] = useState(false);
    const [showClearDialog, setShowClearDialog] = useState(false);
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const [itemToRemove, setItemToRemove] = useState(null);

    useEffect(() => {
        loadSeating();
    }, []);

    const loadSeating = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await SeatingService.getSeating();
            setSeating(response.data.data);
        } catch (e) {
            setError(e.response?.data?.message || 'Ошибка загрузки рассадки');
        } finally {
            setLoading(false);
        }
    };

    const handleAutoAssign = async () => {
        try {
            setAutoAssigning(true);
            setError('');
            setSuccess('');
            const response = await SeatingService.autoAssign();
            setSuccess(response.data.message || 'Рассадка выполнена успешно');
            await loadSeating();
            setTimeout(() => setSuccess(''), 5000);
        } catch (e) {
            setError(e.response?.data?.message || 'Ошибка при автоматической рассадке');
        } finally {
            setAutoAssigning(false);
        }
    };

    const handleClearSeating = async () => {
        try {
            setError('');
            setSuccess('');
            await SeatingService.clearSeating();
            setSuccess('Рассадка успешно очищена');
            setShowClearDialog(false);
            await loadSeating();
            setTimeout(() => setSuccess(''), 3000);
        } catch (e) {
            setError(e.response?.data?.message || 'Ошибка при очистке рассадки');
            setShowClearDialog(false);
        }
    };

    const handleRemoveClick = (item) => {
        setItemToRemove(item);
        setShowRemoveDialog(true);
    };

    const handleRemoveConfirm = async () => {
        try {
            setError('');
            setSuccess('');
            const { type, id } = itemToRemove;
            await SeatingService.removeAssignment(
                type === 'team' ? id : null,
                type === 'individual' ? id : null
            );
            setSuccess('Назначение успешно удалено');
            setShowRemoveDialog(false);
            setItemToRemove(null);
            await loadSeating();
            setTimeout(() => setSuccess(''), 3000);
        } catch (e) {
            setError(e.response?.data?.message || 'Ошибка при удалении назначения');
            setShowRemoveDialog(false);
            setItemToRemove(null);
        }
    };

    const getTotalStats = () => {
        let totalRooms = seating.length;
        let totalCapacity = 0;
        let totalOccupied = 0;
        let totalFree = 0;
        let totalItems = 0;

        seating.forEach(roomData => {
            totalCapacity += roomData.room.capacity;
            totalOccupied += roomData.stats.occupied;
            totalFree += roomData.stats.free;
            totalItems += roomData.items.length;
        });

        return { totalRooms, totalCapacity, totalOccupied, totalFree, totalItems };
    };

    const stats = getTotalStats();

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Рассадка</h1>
                    <p className="admin-page-subtitle">Распределение команд и участников по аудиториям</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                    <button
                        className="btn btn-secondary btn-with-icon"
                        onClick={() => setShowClearDialog(true)}
                        disabled={loading || seating.length === 0}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        Очистить
                    </button>
                    <button
                        className="btn btn-primary btn-with-icon"
                        onClick={handleAutoAssign}
                        disabled={loading || autoAssigning}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                        </svg>
                        {autoAssigning ? 'Рассадка...' : 'Автоматическая рассадка'}
                    </button>
                </div>
            </div>

            {/* Уведомления */}
            {error && (
                <div className="alert alert-error">{error}</div>
            )}
            {success && (
                <div className="alert alert-success">{success}</div>
            )}

            {/* Общая статистика */}
            {seating.length > 0 && (
                <div className="admin-stats-grid" style={{ marginBottom: '2rem' }}>
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                <polyline points="9 22 9 12 15 12 15 22"/>
                            </svg>
                        </div>
                        <div className="admin-stat-content">
                            <div className="admin-stat-label">Аудиторий</div>
                            <div className="admin-stat-value">{stats.totalRooms}</div>
                            <div className="admin-stat-description">Всего аудиторий</div>
                        </div>
                    </div>

                    <div className="admin-stat-card">
                        <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                        </div>
                        <div className="admin-stat-content">
                            <div className="admin-stat-label">Занято мест</div>
                            <div className="admin-stat-value">{stats.totalOccupied} / {stats.totalCapacity}</div>
                            <div className="admin-stat-description">Свободно: {stats.totalFree}</div>
                        </div>
                    </div>

                    <div className="admin-stat-card">
                        <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="7" width="20" height="15" rx="2"/>
                                <polyline points="17 2 12 7 7 2"/>
                            </svg>
                        </div>
                        <div className="admin-stat-content">
                            <div className="admin-stat-label">Размещено</div>
                            <div className="admin-stat-value">{stats.totalItems}</div>
                            <div className="admin-stat-description">Команд и участников</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Список аудиторий */}
            {loading ? (
                <div className="admin-loading">
                    <div className="admin-loading-spinner"></div>
                    <p>Загрузка рассадки...</p>
                </div>
            ) : seating.length === 0 ? (
                <div className="admin-placeholder">
                    <div className="admin-placeholder-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="7" width="20" height="15" rx="2"/>
                            <polyline points="17 2 12 7 7 2"/>
                        </svg>
                    </div>
                    <h2>Рассадка не выполнена</h2>
                    <p>Нажмите "Автоматическая рассадка" для распределения команд и участников по аудиториям</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
                    {seating.map((roomData) => (
                        <div key={roomData.room.id} className="admin-card">
                            <div className="admin-card-header">
                                <div style={{ flex: 1 }}>
                                    <h2 className="admin-card-title">
                                        Аудитория {roomData.room.number}
                                    </h2>
                                    <div style={{ 
                                        display: 'flex', 
                                        gap: 'var(--spacing-lg)', 
                                        marginTop: 'var(--spacing-sm)',
                                        flexWrap: 'wrap'
                                    }}>
                                        <span style={{ 
                                            fontSize: 'var(--font-size-sm)', 
                                            color: 'var(--text-secondary)' 
                                        }}>
                                            Мест: <strong>{roomData.stats.occupied}</strong> / {roomData.room.capacity}
                                            {roomData.stats.free > 0 && (
                                                <span style={{ color: 'var(--primary-color)' }}>
                                                    {' '}(свободно: {roomData.stats.free})
                                                </span>
                                            )}
                                        </span>
                                        <span style={{ 
                                            fontSize: 'var(--font-size-sm)', 
                                            color: 'var(--text-secondary)' 
                                        }}>
                                            Школ: <strong>{roomData.stats.schoolsCount}</strong>
                                        </span>
                                        <span style={{ 
                                            fontSize: 'var(--font-size-sm)', 
                                            color: 'var(--text-secondary)' 
                                        }}>
                                            Команд/участников: <strong>{roomData.items.length}</strong>
                                        </span>
                                    </div>
                                </div>
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    backgroundColor: roomData.stats.free > 0 
                                        ? (roomData.stats.free < 5 ? '#f59e0b' : '#10b981')
                                        : '#ef4444',
                                    flexShrink: 0
                                }} title={
                                    roomData.stats.free === 0 ? 'Аудитория заполнена' :
                                    roomData.stats.free < 5 ? 'Мало свободных мест' :
                                    'Есть свободные места'
                                }></div>
                            </div>

                            {roomData.items.length === 0 ? (
                                <div style={{ 
                                    padding: 'var(--spacing-xl)', 
                                    textAlign: 'center',
                                    color: 'var(--text-tertiary)'
                                }}>
                                    Аудитория пуста
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                    {roomData.items.map((item, index) => (
                                        <div 
                                            key={`${item.type}-${item.id}`}
                                            style={{
                                                padding: 'var(--spacing-md)',
                                                background: 'var(--bg-secondary)',
                                                borderRadius: 'var(--border-radius-md)',
                                                border: '1px solid var(--border-color)',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start',
                                                gap: 'var(--spacing-md)'
                                            }}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <div style={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: 'var(--spacing-sm)',
                                                    marginBottom: 'var(--spacing-xs)'
                                                }}>
                                                    {item.type === 'team' ? (
                                                        <span className="badge badge-team">Команда</span>
                                                    ) : (
                                                        <span className="badge" style={{
                                                            background: 'var(--bg-tertiary)',
                                                            color: 'var(--text-secondary)'
                                                        }}>Участник</span>
                                                    )}
                                                    <strong style={{ color: 'var(--text-primary)' }}>
                                                        {item.name}
                                                    </strong>
                                                </div>
                                                <div style={{ 
                                                    fontSize: 'var(--font-size-sm)', 
                                                    color: 'var(--text-secondary)',
                                                    marginBottom: 'var(--spacing-xs)'
                                                }}>
                                                    Школа: <strong>{item.school}</strong>
                                                </div>
                                                <div style={{ 
                                                    fontSize: 'var(--font-size-sm)', 
                                                    color: 'var(--text-secondary)'
                                                }}>
                                                    Участников: <strong>{item.memberCount}</strong>
                                                    {item.members && item.members.length > 0 && (
                                                        <span style={{ marginLeft: 'var(--spacing-sm)' }}>
                                                            ({item.members.map(m => 
                                                                `${m.last_name} ${m.first_name.charAt(0)}.`
                                                            ).join(', ')})
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                className="btn-icon btn-icon-delete"
                                                onClick={() => handleRemoveClick(item)}
                                                title="Удалить из аудитории"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="3 6 5 6 21 6"/>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Диалог подтверждения очистки */}
            <ConfirmDialog
                isOpen={showClearDialog}
                title="Очистить рассадку?"
                message="Вы уверены, что хотите очистить всю рассадку? Это действие нельзя отменить."
                onConfirm={handleClearSeating}
                onCancel={() => setShowClearDialog(false)}
                confirmText="Очистить"
                cancelText="Отмена"
                danger={true}
            />

            {/* Диалог подтверждения удаления */}
            <ConfirmDialog
                isOpen={showRemoveDialog}
                title="Удалить из аудитории?"
                message={`Вы уверены, что хотите удалить "${itemToRemove?.name}" из аудитории?`}
                onConfirm={handleRemoveConfirm}
                onCancel={() => {
                    setShowRemoveDialog(false);
                    setItemToRemove(null);
                }}
                confirmText="Удалить"
                cancelText="Отмена"
                danger={true}
            />
        </div>
    );
};

export default Seating;
