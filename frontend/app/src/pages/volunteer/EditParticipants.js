import React, { useState, useEffect, useRef } from 'react';
import ParticipantsService from '../../services/ParticipantsService';
import UserService from '../../services/UserService';
import EditProfileModal from '../../components/EditProfileModal';
import ProfileHistoryModal from '../../components/ProfileHistoryModal';
import Toast from '../../components/Toast';
import '../../styles/admin.css';
import '../../styles/volunteer.css';

const EditParticipants = () => {
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ type: null, message: '' });
    const [editingParticipant, setEditingParticipant] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [historyParticipant, setHistoryParticipant] = useState(null);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [historyMap, setHistoryMap] = useState({}); // Map participantId -> hasHistory
    const searchInputRef = useRef(null);
    const searchTimeoutRef = useRef(null);

    // Фильтры и пагинация
    const [filters, setFilters] = useState({
        page: 1,
        limit: 50,
        search: '',
        region: '',
        grade: '',
        programming_language: '',
        hasTeam: '',
        participation_format: '',
        attendance: '',
        sortBy: 'last_name',
        sortOrder: 'ASC'
    });

    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0
    });

    // Debounced загрузка участников
    useEffect(() => {
        // Очищаем предыдущий таймер
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Если это поиск, добавляем задержку
        if (filters.search) {
            searchTimeoutRef.current = setTimeout(() => {
                loadParticipants();
            }, 500); // 500ms задержка
        } else {
            // Для остальных фильтров загружаем сразу
            loadParticipants();
        }

        // Очистка при размонтировании
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [filters]);

    // Восстанавливаем фокус в поле поиска после обновления
    useEffect(() => {
        if (searchInputRef.current && filters.search) {
            // Небольшая задержка, чтобы DOM обновился
            setTimeout(() => {
                searchInputRef.current?.focus();
                // Устанавливаем курсор в конец текста
                const length = searchInputRef.current.value.length;
                searchInputRef.current.setSelectionRange(length, length);
            }, 0);
        }
    }, [participants, filters.search]);

    const loadParticipants = async () => {
        try {
            setLoading(true);
            setNotification({ type: null, message: '' });
            const response = await ParticipantsService.getAllForVolunteer(filters);
            const participantsData = response.data.data.participants;
            setParticipants(participantsData);
            setPagination(response.data.data.pagination);
            
            // Загружаем историю для каждого участника
            loadHistoryForParticipants(participantsData);
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            setNotification({ 
                type: 'error', 
                message: error.response?.data?.message || 'Не удалось загрузить данные. Попробуйте обновить страницу.' 
            });
        } finally {
            setLoading(false);
        }
    };

    const loadHistoryForParticipants = async (participantsList) => {
        // Загружаем историю для всех участников параллельно
        const historyPromises = participantsList.map(async (participant) => {
            try {
                const response = await UserService.getProfileHistory(participant.id);
                return {
                    participantId: participant.id,
                    hasHistory: response.data.data && response.data.data.length > 0
                };
            } catch (error) {
                console.error(`Ошибка загрузки истории для участника ${participant.id}:`, error);
                return {
                    participantId: participant.id,
                    hasHistory: false
                };
            }
        });

        const historyResults = await Promise.all(historyPromises);
        const newHistoryMap = {};
        historyResults.forEach(result => {
            newHistoryMap[result.participantId] = result.hasHistory;
        });
        setHistoryMap(newHistoryMap);
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value,
            page: 1
        }));
    };

    const handleEdit = (participant) => {
        setEditingParticipant(participant);
        setIsModalOpen(true);
    };

    const handleShowHistory = (participant) => {
        setHistoryParticipant(participant);
        setIsHistoryModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingParticipant(null);
    };

    const handleHistoryModalClose = () => {
        setIsHistoryModalOpen(false);
        setHistoryParticipant(null);
    };

    const handleSave = () => {
        setNotification({ type: 'success', message: 'Данные участника успешно обновлены' });
        // Обновляем историю для отредактированного участника
        if (editingParticipant) {
            setHistoryMap(prev => ({
                ...prev,
                [editingParticipant.id]: true // После редактирования точно есть история
            }));
        }
        loadParticipants();
    };

    const handleSort = (field) => {
        setFilters(prev => ({
            ...prev,
            sortBy: field,
            sortOrder: prev.sortBy === field && prev.sortOrder === 'ASC' ? 'DESC' : 'ASC'
        }));
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

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Редактирование данных участников</h1>
                    <p className="admin-page-subtitle">
                        Редактирование личных данных участников чемпионата
                    </p>
                </div>
            </div>

            {notification.type && (
                <Toast
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification({ type: null, message: '' })}
                    duration={5000}
                />
            )}

            {/* Фильтры */}
            <div className="participants-filters">
                <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Поиск по ФИО или email..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="form-input"
                />

                <select
                    value={filters.grade}
                    onChange={(e) => handleFilterChange('grade', e.target.value)}
                    className="form-select"
                >
                    <option value="">Все классы</option>
                    {[9, 10, 11].map((g) => (
                        <option key={g} value={g}>{g} класс</option>
                    ))}
                </select>

                <select
                    value={filters.hasTeam}
                    onChange={(e) => handleFilterChange('hasTeam', e.target.value)}
                    className="form-select"
                >
                    <option value="">Все участники</option>
                    <option value="true">С командой</option>
                    <option value="false">Без команды</option>
                </select>

                <select
                    value={filters.participation_format}
                    onChange={(e) => handleFilterChange('participation_format', e.target.value)}
                    className="form-select"
                >
                    <option value="">Все форматы</option>
                    <option value="individual">Индивидуальное</option>
                    <option value="team">Командное</option>
                </select>

                <select
                    value={filters.attendance}
                    onChange={(e) => handleFilterChange('attendance', e.target.value)}
                    className="form-select"
                >
                    <option value="">Все участники</option>
                    <option value="true">Пришедшие</option>
                    <option value="false">Не пришедшие</option>
                </select>

                <button
                    className="btn btn-outline"
                    onClick={() => setFilters({
                        page: 1,
                        limit: 50,
                        search: '',
                        region: '',
                        grade: '',
                        programming_language: '',
                        hasTeam: '',
                        participation_format: '',
                        attendance: '',
                        sortBy: 'last_name',
                        sortOrder: 'ASC'
                    })}
                >
                    Сбросить
                </button>
            </div>

            {/* Таблица участников */}
            {loading ? (
                <div className="loading">Загрузка...</div>
            ) : participants.length === 0 ? (
                <div className="admin-placeholder">
                    <div className="admin-placeholder-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                    </div>
                    <h2>Участники не найдены</h2>
                    <p>Попробуйте изменить фильтры поиска</p>
                </div>
            ) : (
                <>
                    <div className="participants-table-container">
                        <table className="participants-table">
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort('last_name')}>
                                        ФИО
                                        {filters.sortBy === 'last_name' && (
                                            <span style={{ marginLeft: '8px' }}>
                                                {filters.sortOrder === 'ASC' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </th>
                                    <th onClick={() => handleSort('email')}>
                                        Email
                                        {filters.sortBy === 'email' && (
                                            <span style={{ marginLeft: '8px' }}>
                                                {filters.sortOrder === 'ASC' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </th>
                                    <th>Школа</th>
                                    <th>Класс</th>
                                    <th>Команда</th>
                                    <th style={{ width: '120px', textAlign: 'center' }}>История</th>
                                    <th style={{ width: '150px', textAlign: 'center' }}>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {participants.map((participant) => {
                                    const hasHistory = historyMap[participant.id] || false;
                                    return (
                                        <tr key={participant.id}>
                                            <td style={{ fontWeight: 600 }}>
                                                {participant.last_name} {participant.first_name} {participant.second_name || ''}
                                            </td>
                                            <td style={{ fontSize: '13px', color: '#64748b' }}>{participant.email}</td>
                                            <td style={{ fontSize: '13px', color: '#64748b' }}>{participant.school}</td>
                                            <td>{participant.grade} класс</td>
                                            <td>{participant.Team?.name || participant.teamName || '–'}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                {hasHistory ? (
                                                    <button
                                                        onClick={() => handleShowHistory(participant)}
                                                        style={{ 
                                                            display: 'inline-flex', 
                                                            alignItems: 'center', 
                                                            gap: '4px',
                                                            color: '#3b82f6',
                                                            fontSize: '13px',
                                                            fontWeight: 500,
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            padding: '4px 8px',
                                                            borderRadius: '4px',
                                                            transition: 'background 0.2s',
                                                            textDecoration: 'underline',
                                                            textDecorationColor: 'rgba(59, 130, 246, 0.3)'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.target.style.background = '#f1f5f9';
                                                            e.target.style.textDecorationColor = '#3b82f6';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.target.style.background = 'none';
                                                            e.target.style.textDecorationColor = 'rgba(59, 130, 246, 0.3)';
                                                        }}
                                                        title="Нажмите, чтобы просмотреть историю изменений"
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <circle cx="12" cy="12" r="10"/>
                                                            <polyline points="12 6 12 12 16 14"/>
                                                        </svg>
                                                        Есть изменения
                                                    </button>
                                                ) : (
                                                    <span style={{ 
                                                        color: '#94a3b8',
                                                        fontSize: '13px'
                                                    }}>
                                                        Нет изменений
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button
                                                    className={hasHistory ? "btn btn-primary btn-sm btn-with-icon" : "btn btn-secondary btn-sm btn-with-icon"}
                                                    onClick={() => handleEdit(participant)}
                                                    style={{ margin: '0 auto' }}
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                                    </svg>
                                                    Редактировать
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Пагинация */}
                    {pagination.totalPages > 1 && (
                        <div className="pagination" style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                            <button
                                className="btn btn-outline"
                                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={filters.page === 1}
                            >
                                Назад
                            </button>
                            <span style={{ display: 'flex', alignItems: 'center', padding: '0 16px' }}>
                                Страница {pagination.page} из {pagination.totalPages}
                            </span>
                            <button
                                className="btn btn-outline"
                                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={filters.page >= pagination.totalPages}
                            >
                                Вперед
                            </button>
                        </div>
                    )}
                </>
            )}

            {editingParticipant && (
                <EditProfileModal
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    profile={editingParticipant}
                    userId={editingParticipant.id}
                    onSave={handleSave}
                />
            )}

            {historyParticipant && (
                <ProfileHistoryModal
                    isOpen={isHistoryModalOpen}
                    onClose={handleHistoryModalClose}
                    userId={historyParticipant.id}
                    participantName={`${historyParticipant.last_name} ${historyParticipant.first_name} ${historyParticipant.second_name || ''}`.trim()}
                />
            )}
        </div>
    );
};

export default EditParticipants;

