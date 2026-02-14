import React, { useState, useEffect } from 'react';
import AttendanceService from '../../services/AttendanceService';
import Toast from '../../components/Toast';
import '../../styles/admin.css';
import '../../styles/volunteer.css';

const AttendanceList = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedRoom, setSelectedRoom] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [statistics, setStatistics] = useState(null);
    const [notification, setNotification] = useState({ type: null, message: '' });
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [participantsResponse, statsResponse] = await Promise.all([
                AttendanceService.getParticipantsWithSeating(),
                AttendanceService.getStatistics()
            ]);
            
            setData(participantsResponse.data.data);
            setStatistics(statsResponse.data.data);
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            setNotification({ 
                type: 'error', 
                message: 'Не удалось загрузить данные. Попробуйте обновить страницу.' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAttendanceToggle = async (userId, currentAttendance) => {
        try {
            const response = await AttendanceService.markAttendance(userId, !currentAttendance);
            
            // Если статус уже был установлен другим волонтером, показываем предупреждение
            if (response.data.data.wasAlreadySet) {
                setNotification({ 
                    type: 'warning', 
                    message: response.data.data.message + ' (возможно, другой волонтер уже отметил)' 
                });
            } else {
                setNotification({ 
                    type: 'success', 
                    message: response.data.data.message 
                });
            }
            
            await loadData(); // Перезагружаем данные
        } catch (error) {
            console.error('Ошибка отметки присутствия:', error);
            const errorMessage = error.response?.data?.message || 'Не удалось отметить присутствие. Попробуйте еще раз.';
            setNotification({ type: 'error', message: errorMessage });
            // Перезагружаем данные даже при ошибке, чтобы показать актуальное состояние
            await loadData();
        }
    };

    const handleMarkAllInRoom = async (roomId, attendance) => {
        const room = data.rooms.find(r => r.room.id === roomId);
        if (!room) {
            setNotification({ type: 'error', message: 'Кабинет не найден' });
            return;
        }

        const userIds = room.participants.map(p => p.id);
        
        if (userIds.length === 0) {
            setNotification({ type: 'error', message: 'В кабинете нет участников' });
            return;
        }

        if (!window.confirm(`Отметить всех участников кабинета ${room.room.number} как ${attendance ? 'присутствующих' : 'отсутствующих'}?`)) {
            return;
        }

        try {
            const response = await AttendanceService.markMultipleAttendance(userIds, attendance);
            setNotification({ 
                type: 'success', 
                message: `Отмечено ${userIds.length} участников` 
            });
            await loadData();
        } catch (error) {
            console.error('Ошибка массовой отметки:', error);
            const errorMessage = error.response?.data?.message || 'Не удалось выполнить массовую отметку. Попробуйте еще раз.';
            setNotification({ type: 'error', message: errorMessage });
            // Перезагружаем данные даже при ошибке
            await loadData();
        }
    };

    const handleExportAllRoomsToPDF = async () => {
        try {
            const response = await AttendanceService.exportAllRoomsToPDF();
            
            // Создаем blob из response (Excel)
            const blob = new Blob([response.data], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
            const url = window.URL.createObjectURL(blob);
            
            // Создаем ссылку для скачивания
            const link = document.createElement('a');
            link.href = url;
            link.download = `Посадочные_листы_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Очищаем URL после небольшой задержки
            setTimeout(() => window.URL.revokeObjectURL(url), 100);
            
            setNotification({ 
                type: 'success', 
                message: 'Файл успешно скачан' 
            });
        } catch (error) {
            console.error('Ошибка экспорта посадочных листов:', error);
            const errorMessage = error.response?.data?.message || 'Не удалось экспортировать посадочные листы. Попробуйте еще раз.';
            setNotification({ type: 'error', message: errorMessage });
        }
    };

    const handleShowHistory = async (participant) => {
        try {
            setSelectedParticipant(participant);
            setShowHistoryModal(true);
            setLoadingHistory(true);
            
            const response = await AttendanceService.getAttendanceHistory(participant.id);
            setHistory(response.data.data || []);
        } catch (error) {
            console.error('Ошибка загрузки истории:', error);
            setNotification({ 
                type: 'error', 
                message: 'Не удалось загрузить историю отметок' 
            });
        } finally {
            setLoadingHistory(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-loading">
                    <div className="spinner"></div>
                    <p>Загрузка данных...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="admin-page">
                <div className="admin-page-header">
                    <h1 className="admin-page-title">Отметка присутствия</h1>
                </div>
                <div className="admin-info-box">
                    <p>Нет данных для отображения</p>
                </div>
            </div>
        );
    }

    // Фильтрация участников
    const getFilteredRooms = () => {
        let rooms = data.rooms;

        // Фильтр по кабинету
        if (selectedRoom !== 'all') {
            rooms = rooms.filter(r => r.room.id === parseInt(selectedRoom));
        }

        // Фильтр по поиску
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            rooms = rooms.map(room => ({
                ...room,
                participants: room.participants.filter(p => 
                    p.fullName.toLowerCase().includes(query) ||
                    p.school.toLowerCase().includes(query) ||
                    (p.teamName && p.teamName.toLowerCase().includes(query))
                )
            })).filter(room => room.participants.length > 0);
        }

        return rooms;
    };

    const filteredRooms = getFilteredRooms();
    const totalFilteredParticipants = filteredRooms.reduce((sum, r) => sum + r.participants.length, 0);
    const totalFilteredPresent = filteredRooms.reduce((sum, r) => sum + r.participants.filter(p => p.attendance).length, 0);

    return (
        <div className="admin-page">
            {notification.message && (
                <Toast
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification({ type: null, message: '' })}
                />
            )}

            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Отметка присутствия</h1>
                    <p className="admin-page-subtitle">
                        Отмечайте участников, которые пришли на чемпионат
                    </p>
                </div>
                <button
                    className="volunteer-export-btn"
                    onClick={handleExportAllRoomsToPDF}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <polyline points="9 15 12 12 15 15"/>
                        <line x1="12" y1="12" x2="12" y2="21"/>
                    </svg>
                    Посадочные листы (Excel)
                </button>
            </div>

            {/* Статистика */}
            {statistics && (
                <div className="admin-stats-grid" style={{ marginBottom: '24px' }}>
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                        </div>
                        <div className="admin-stat-content">
                            <div className="admin-stat-label">Всего участников</div>
                            <div className="admin-stat-value">{data.statistics.totalParticipants}</div>
                        </div>
                    </div>

                    <div className="admin-stat-card">
                        <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                        </div>
                        <div className="admin-stat-content">
                            <div className="admin-stat-label">Присутствуют</div>
                            <div className="admin-stat-value">{data.statistics.totalPresent}</div>
                            <div className="admin-stat-description">
                                {data.statistics.totalParticipants > 0 
                                    ? `${((data.statistics.totalPresent / data.statistics.totalParticipants) * 100).toFixed(1)}%`
                                    : '0%'}
                            </div>
                        </div>
                    </div>

                    <div className="admin-stat-card">
                        <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="15" y1="9" x2="9" y2="15"/>
                                <line x1="9" y1="9" x2="15" y2="15"/>
                            </svg>
                        </div>
                        <div className="admin-stat-content">
                            <div className="admin-stat-label">Отсутствуют</div>
                            <div className="admin-stat-value">{data.statistics.totalAbsent}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Фильтры */}
            <div className="volunteer-filters">
                <div className="volunteer-filter-group">
                    <label className="volunteer-filter-label">Кабинет:</label>
                    <select 
                        className="volunteer-filter-select"
                        value={selectedRoom}
                        onChange={(e) => setSelectedRoom(e.target.value)}
                    >
                        <option value="all">Все кабинеты</option>
                        {data.rooms.map(room => (
                            <option key={room.room.id} value={room.room.id}>
                                Кабинет {room.room.number} ({room.participants.length} чел.)
                            </option>
                        ))}
                    </select>
                </div>

                <div className="volunteer-filter-group" style={{ flex: 1 }}>
                    <label className="volunteer-filter-label">Поиск:</label>
                    <input
                        type="text"
                        className="volunteer-filter-input"
                        placeholder="Поиск по ФИО, школе, команде..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Список по кабинетам */}
            {filteredRooms.length === 0 ? (
                <div className="admin-info-box">
                    <p>Нет участников, соответствующих фильтрам</p>
                </div>
            ) : (
                filteredRooms.map(roomData => (
                    <div key={roomData.room.id} className="volunteer-room-section">
                        <div className="volunteer-room-header">
                            <div>
                                <h2 className="volunteer-room-title">
                                    Кабинет {roomData.room.number}
                                </h2>
                                <span className="volunteer-room-stats">
                                    {roomData.presentCount} из {roomData.participants.length} присутствуют
                                </span>
                            </div>
                            <div className="volunteer-room-actions">
                                <button
                                    className="volunteer-btn volunteer-btn-success volunteer-btn-sm"
                                    onClick={() => handleMarkAllInRoom(roomData.room.id, true)}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="20 6 9 17 4 12"/>
                                    </svg>
                                    Отметить всех
                                </button>
                                <button
                                    className="volunteer-btn volunteer-btn-danger volunteer-btn-sm"
                                    onClick={() => handleMarkAllInRoom(roomData.room.id, false)}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18"/>
                                        <line x1="6" y1="6" x2="18" y2="18"/>
                                    </svg>
                                    Снять отметки
                                </button>
                            </div>
                        </div>

                        <div className="volunteer-table-container">
                            <table className="volunteer-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '50px' }}>№</th>
                                        <th>ФИО</th>
                                        <th>Школа</th>
                                        <th>Команда</th>
                                        <th style={{ width: '150px', textAlign: 'center' }}>Присутствие</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roomData.participants.map((participant, index) => (
                                        <tr key={participant.id}>
                                            <td>{index + 1}</td>
                                            <td style={{ fontWeight: 600 }}>{participant.fullName}</td>
                                            <td style={{ fontSize: '13px', color: '#64748b' }}>{participant.school}</td>
                                            <td>{participant.teamName || '–'}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                                                    <button
                                                        className={`volunteer-attendance-btn ${participant.attendance ? 'present' : 'absent'}`}
                                                        onClick={() => handleAttendanceToggle(participant.id, participant.attendance)}
                                                    >
                                                        {participant.attendance ? (
                                                            <>
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                                    <polyline points="20 6 9 17 4 12"/>
                                                                </svg>
                                                                Присутствует
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                                                </svg>
                                                                Отсутствует
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        className="volunteer-btn volunteer-btn-outline volunteer-btn-sm"
                                                        onClick={() => handleShowHistory(participant)}
                                                        title="История отметок"
                                                        style={{ minWidth: 'auto', padding: '6px 10px' }}
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <circle cx="12" cy="12" r="10"/>
                                                            <line x1="12" y1="16" x2="12" y2="12"/>
                                                            <line x1="12" y1="8" x2="12.01" y2="8"/>
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))
            )}

            {/* Модальное окно с историей отметок */}
            {showHistoryModal && selectedParticipant && (
                <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
                        <div className="modal-header" style={{ marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>
                                История отметок: {selectedParticipant.fullName}
                            </h2>
                            <button 
                                className="modal-close"
                                onClick={() => setShowHistoryModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        
                        {loadingHistory ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <p>Загрузка истории...</p>
                            </div>
                        ) : history.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                <p>История отметок пуста</p>
                            </div>
                        ) : (
                            <div>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Дата и время</th>
                                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Отметил</th>
                                            <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>Статус</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.map((record) => (
                                            <tr key={record.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '12px' }}>
                                                    {new Date(record.createdAt).toLocaleString('ru-RU', {
                                                        year: 'numeric',
                                                        month: '2-digit',
                                                        day: '2-digit',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    {record.markedBy ? (
                                                        <span>
                                                            {record.markedBy.name}
                                                            <span style={{ 
                                                                marginLeft: '8px', 
                                                                padding: '2px 8px', 
                                                                borderRadius: '4px',
                                                                fontSize: '12px',
                                                                background: record.markedBy.role === 'admin' ? '#dbeafe' : '#fef3c7',
                                                                color: record.markedBy.role === 'admin' ? '#1e40af' : '#92400e'
                                                            }}>
                                                                {record.markedBy.role === 'admin' ? 'Админ' : 'Волонтер'}
                                                            </span>
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: '#94a3b8' }}>Неизвестно</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                                    <span style={{
                                                        padding: '4px 12px',
                                                        borderRadius: '12px',
                                                        fontSize: '14px',
                                                        fontWeight: 500,
                                                        background: record.attendance ? '#d1fae5' : '#fee2e2',
                                                        color: record.attendance ? '#065f46' : '#991b1b'
                                                    }}>
                                                        {record.attendance ? 'Присутствует' : 'Отсутствует'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceList;

