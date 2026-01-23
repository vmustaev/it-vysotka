import React, { useState, useEffect } from 'react';
import SeatingService from '../../services/SeatingService';
import TeamService from '../../services/TeamService';
import ParticipantsService from '../../services/ParticipantsService';
import ConfirmDialog from '../../components/ConfirmDialog';
import Toast from '../../components/Toast';

const Seating = () => {
    const [seating, setSeating] = useState([]);
    const [unassignedItems, setUnassignedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingUnassigned, setLoadingUnassigned] = useState(true);
    const [notification, setNotification] = useState({ type: null, message: '' });
    const [autoAssigning, setAutoAssigning] = useState(false);
    const [clearing, setClearing] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const [showClearDialog, setShowClearDialog] = useState(false);
    const [itemToRemove, setItemToRemove] = useState(null);
    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOverRoom, setDragOverRoom] = useState(null);

    useEffect(() => {
        loadSeating();
    }, []);

    const loadSeating = async () => {
        try {
            setLoading(true);
            setNotification({ type: null, message: '' });
            const response = await SeatingService.getSeating();
            const seatingData = response.data.data;
            setSeating(seatingData);
            // Загружаем нерассаженных после успешной загрузки рассадки
            await loadUnassigned(seatingData);
        } catch (e) {
            setNotification({ type: 'error', message: e.response?.data?.message || 'Ошибка загрузки рассадки' });
        } finally {
            setLoading(false);
        }
    };

    const loadUnassigned = async (currentSeating = seating) => {
        try {
            setLoadingUnassigned(true);
            
            // Получаем все команды
            const teamsResponse = await TeamService.getAllTeams();
            const allTeams = teamsResponse.data.data || [];
            
            // Получаем всех индивидуальных участников
            const participantsResponse = await ParticipantsService.getAll({ 
                limit: 1000,
                participation_format: 'individual',
                hasTeam: 'false'
            });
            const allParticipants = participantsResponse.data.data.participants || [];
            
            // Используем переданную рассадку или текущее состояние
            // Собираем ID уже размещенных команд и участников
            const assignedTeamIds = new Set();
            const assignedUserIds = new Set();
            
            currentSeating.forEach(roomData => {
                roomData.items.forEach(item => {
                    if (item.type === 'team') {
                        assignedTeamIds.add(item.id);
                    } else {
                        assignedUserIds.add(item.id);
                    }
                });
            });
            
            // Фильтруем нерассаженные команды
            const unassignedTeams = allTeams
                .filter(team => !assignedTeamIds.has(team.id))
                .map(team => {
                    const members = team.members || [];
                    const leader = members.find(m => m.isLead === true) || members[0];
                    const school = leader?.school || 'Неизвестно';
                    
                    return {
                        type: 'team',
                        id: team.id,
                        name: team.name,
                        memberCount: team.memberCount || members.length || 0,
                        school: school,
                        members: members
                    };
                });
            
            // Фильтруем нерассаженных индивидуальных участников
            const unassignedIndividuals = allParticipants
                .filter(p => !assignedUserIds.has(p.id))
                .map(p => ({
                    type: 'individual',
                    id: p.id,
                    name: `${p.last_name} ${p.first_name} ${p.second_name || ''}`.trim(),
                    school: p.school,
                    memberCount: 1,
                    members: [p]
                }));
            
            // Объединяем в один список и сортируем по имени
            const combined = [...unassignedTeams, ...unassignedIndividuals].sort((a, b) => 
                a.name.localeCompare(b.name)
            );
            
            setUnassignedItems(combined);
        } catch (e) {
            setNotification({ type: 'error', message: e.response?.data?.message || 'Ошибка загрузки нерассаженных' });
        } finally {
            setLoadingUnassigned(false);
        }
    };

    const handleAutoAssign = async () => {
        try {
            setAutoAssigning(true);
            setNotification({ type: null, message: '' });
            const response = await SeatingService.autoAssign();
            setNotification({ type: 'success', message: response.data.message || 'Рассадка выполнена успешно' });
            await loadSeating();
        } catch (e) {
            setNotification({ type: 'error', message: e.response?.data?.message || 'Ошибка при автоматической рассадке' });
        } finally {
            setAutoAssigning(false);
        }
    };

    const handleClearSeating = async () => {
        try {
            setClearing(true);
            setNotification({ type: null, message: '' });
            await SeatingService.clearSeating();
            setNotification({ type: 'success', message: 'Рассадка успешно очищена' });
            setShowClearDialog(false);
            await loadSeating();
        } catch (e) {
            setNotification({ type: 'error', message: e.response?.data?.message || 'Ошибка при очистке рассадки' });
            setShowClearDialog(false);
        } finally {
            setClearing(false);
        }
    };

    const handleDragStart = (e, item) => {
        setDraggedItem(item);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', '');
        e.target.style.opacity = '0.5';
    };

    const handleDragEnd = (e) => {
        e.target.style.opacity = '1';
        setDraggedItem(null);
        setDragOverRoom(null);
    };

    const handleDragOver = (e, roomId) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverRoom(roomId);
    };

    const handleDragLeave = () => {
        setDragOverRoom(null);
    };

    const handleDrop = async (e, roomData) => {
        e.preventDefault();
        setDragOverRoom(null);

        if (!draggedItem) return;

        try {
            setNotification({ type: null, message: '' });
            
            await SeatingService.assignItem(
                draggedItem.type === 'team' ? draggedItem.id : null,
                draggedItem.type === 'individual' ? draggedItem.id : null,
                roomData.room.id
            );
            
            setNotification({ type: 'success', message: 'Успешно добавлено в аудиторию' });
            await loadSeating();
        } catch (e) {
            setNotification({ type: 'error', message: e.response?.data?.message || 'Ошибка при добавлении' });
        }
    };

    const handleRemoveClick = (item) => {
        setItemToRemove(item);
        setShowRemoveDialog(true);
    };

    const handleRemoveConfirm = async () => {
        try {
            setNotification({ type: null, message: '' });
            const { type, id } = itemToRemove;
            await SeatingService.removeAssignment(
                type === 'team' ? id : null,
                type === 'individual' ? id : null
            );
            setNotification({ type: 'success', message: 'Назначение успешно удалено' });
            setShowRemoveDialog(false);
            setItemToRemove(null);
            await loadSeating();
        } catch (e) {
            setNotification({ type: 'error', message: e.response?.data?.message || 'Ошибка при удалении назначения' });
            setShowRemoveDialog(false);
            setItemToRemove(null);
        }
    };

    const getRoomStats = (roomData) => {
        const occupied = roomData.items.length;
        const free = roomData.room.capacity - occupied;
        const schools = new Set(roomData.items.map(item => item.school));
        const schoolsCount = schools.size;
        
        return { occupied, free, schoolsCount };
    };

    const handleExport = async () => {
        try {
            setExporting(true);
            setNotification({ type: null, message: '' });
            const response = await SeatingService.exportToExcel();
            
            // Создаем ссылку для скачивания файла
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const date = new Date().toISOString().split('T')[0];
            link.setAttribute('download', `Рассадка_IT-Высотка_${date}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            setNotification({ type: 'success', message: 'Файл успешно скачан!' });
        } catch (e) {
            setNotification({ type: 'error', message: e.response?.data?.message || 'Ошибка экспорта' });
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                <h1 className="admin-page-title">Рассадка</h1>
                    <p className="admin-page-subtitle">Распределение команд и участников по аудиториям</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
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
                    <button
                        className="btn btn-primary btn-with-icon"
                        onClick={handleExport}
                        disabled={loading || exporting}
                        style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        {exporting ? 'Экспорт...' : 'Экспорт в Excel'}
                    </button>
                    <button
                        className="btn btn-secondary btn-with-icon"
                        onClick={() => setShowClearDialog(true)}
                        disabled={loading || clearing || autoAssigning}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        {clearing ? 'Очистка...' : 'Очистить рассадку'}
                    </button>
                </div>
            </div>

            {/* Основной контент: аудитории слева, нерассаженные справа */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 350px', 
                gap: 'var(--spacing-xl)',
                alignItems: 'start'
            }}>
                {/* Список аудиторий */}
                <div>
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
                            <h2>Нет аудиторий</h2>
                            <p>Сначала добавьте аудитории в разделе "Аудитории"</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
                            {seating.map((roomData) => {
                                const isDragOver = dragOverRoom === roomData.room.id;
                                const roomStats = getRoomStats(roomData);
                                
                                // Проверяем, есть ли в аудитории участники из одной школы
                                const schoolCounts = {};
                                roomData.items.forEach(item => {
                                    if (!schoolCounts[item.school]) {
                                        schoolCounts[item.school] = 0;
                                    }
                                    schoolCounts[item.school]++;
                                });
                                const hasDuplicateSchools = Object.values(schoolCounts).some(count => count > 1);
                                
                                // Находим школы с дубликатами
                                const duplicateSchools = Object.entries(schoolCounts)
                                    .filter(([school, count]) => count > 1)
                                    .map(([school]) => school);

                                return (
                                    <div 
                                        key={roomData.room.id} 
                                        className="admin-card"
                                        onDragOver={(e) => handleDragOver(e, roomData.room.id)}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, roomData)}
                                        style={{
                                            border: isDragOver 
                                                ? '2px dashed var(--primary-color)' 
                                                : hasDuplicateSchools 
                                                    ? '2px solid rgba(245, 158, 11, 0.5)' 
                                                    : undefined,
                                            backgroundColor: isDragOver 
                                                ? 'rgba(99, 102, 241, 0.05)' 
                                                : hasDuplicateSchools 
                                                    ? 'rgba(245, 158, 11, 0.05)' 
                                                    : undefined,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div className="admin-card-header">
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                                    <h2 className="admin-card-title">
                                                        Аудитория {roomData.room.number}
                                                    </h2>
                                                    {hasDuplicateSchools && (
                                                        <svg 
                                                            width="20" 
                                                            height="20" 
                                                            viewBox="0 0 24 24" 
                                                            fill="none" 
                                                            stroke="#f59e0b" 
                                                            strokeWidth="2"
                                                            style={{ flexShrink: 0 }}
                                                            title={`В этой аудитории есть участники из одной школы: ${duplicateSchools.join(', ')}`}
                                                        >
                                                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                                            <line x1="12" y1="9" x2="12" y2="13"/>
                                                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                            <div style={{
                                                fontSize: 'var(--font-size-lg)',
                                                fontWeight: 'var(--font-weight-semibold)',
                                                color: (() => {
                                                    const occupied = roomStats.occupied;
                                                    const capacity = roomData.room.capacity;
                                                    const half = capacity / 2;
                                                    
                                                    if (occupied === 0) {
                                                        return 'var(--text-tertiary)';
                                                    } else if (occupied <= half) {
                                                        return '#10b981'; // зеленый
                                                    } else if (occupied < capacity) {
                                                        return '#f59e0b'; // оранжевый
                                                    } else {
                                                        return '#ef4444'; // красный
                                                    }
                                                })(),
                                                flexShrink: 0
                                            }}>
                                                {roomStats.occupied}/{roomData.room.capacity}
                                            </div>
                                        </div>

                                        {roomData.items.length === 0 ? (
                                            <div style={{ 
                                                padding: 'var(--spacing-xl)', 
                                                textAlign: 'center',
                                                color: 'var(--text-tertiary)',
                                                border: '2px dashed var(--border-color)',
                                                borderRadius: 'var(--border-radius-md)',
                                                minHeight: '100px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                Перетащите участников сюда
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                                {roomData.items.map((item) => {
                                                    return (
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
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Панель нерассаженных участников */}
                <div className="admin-card" style={{ position: 'sticky', top: '100px', maxHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
                    <div className="admin-card-header">
                        <h2 className="admin-card-title">Нерассаженные</h2>
                        <span className="badge" style={{ background: 'var(--bg-tertiary)' }}>
                            {unassignedItems.length}
                        </span>
                    </div>
                    {loadingUnassigned ? (
                        <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
                            <div className="admin-loading-spinner" style={{ margin: '0 auto' }}></div>
                            <p style={{ marginTop: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>
                                Загрузка...
                            </p>
                        </div>
                    ) : unassignedItems.length === 0 ? (
                        <div style={{ 
                            padding: 'var(--spacing-xl)', 
                            textAlign: 'center',
                            color: 'var(--text-tertiary)'
                        }}>
                            Все участники размещены
                        </div>
                    ) : (
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: 'var(--spacing-sm)',
                            flex: 1,
                            overflowY: 'auto',
                            minHeight: 0
                        }}>
                            {unassignedItems.map((item) => (
                                <div
                                    key={`${item.type}-${item.id}`}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, item)}
                                    onDragEnd={handleDragEnd}
                                    style={{
                                        padding: 'var(--spacing-md)',
                                        background: 'var(--bg-secondary)',
                                        borderRadius: 'var(--border-radius-md)',
                                        border: '1px solid var(--border-color)',
                                        cursor: 'grab',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (draggedItem?.id !== item.id) {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = '';
                                        e.currentTarget.style.boxShadow = '';
                                    }}
                                >
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
                                        <strong style={{ color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)' }}>
                                            {item.name}
                                        </strong>
                                    </div>
                                    <div style={{ 
                                        fontSize: 'var(--font-size-xs)', 
                                        color: 'var(--text-secondary)'
                                    }}>
                                        Школа: {item.school}
                                        {item.type === 'team' && ` • ${item.memberCount} участников`}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

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

            {/* Диалог подтверждения очистки */}
            <ConfirmDialog
                isOpen={showClearDialog}
                title="Очистить рассадку?"
                message="Вы уверены, что хотите очистить всю рассадку? Все назначения будут удалены."
                onConfirm={handleClearSeating}
                onCancel={() => {
                    setShowClearDialog(false);
                }}
                confirmText="Очистить"
                cancelText="Отмена"
                danger={true}
            />

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

export default Seating;
