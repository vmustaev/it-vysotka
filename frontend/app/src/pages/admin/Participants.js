import React, { useState, useEffect } from 'react';
import ParticipantsService from '../../services/ParticipantsService';
import TeamService from '../../services/TeamService';
import Toast from '../../components/Toast';

const Participants = () => {
    const [participants, setParticipants] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [notification, setNotification] = useState({ type: null, message: '' });
    const [expandedTeams, setExpandedTeams] = useState(new Set()); // Для раскрывающихся команд
    const [teams, setTeams] = useState([]); // Список всех команд
    const [individualParticipants, setIndividualParticipants] = useState([]); // Индивидуальные участники
    const [activeTab, setActiveTab] = useState('participants'); // 'participants', 'teams' или 'individual'
    const [editingPlace, setEditingPlace] = useState(null); // ID участника, чье место редактируется
    const [placeValue, setPlaceValue] = useState(''); // Значение редактируемого места

    // Фильтры и пагинация
    const [filters, setFilters] = useState({
        page: 1,
        limit: 20,
        search: '',
        region: '',
        grade: '',
        programming_language: '',
        hasTeam: '',
        participation_format: '',
        sortBy: 'id',
        sortOrder: 'ASC'
    });

    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0
    });

    // Загрузка данных при монтировании и изменении фильтров
    useEffect(() => {
        loadParticipants();
    }, [filters]);

    // Загрузка статистики, команд и индивидуальных участников один раз при монтировании
    useEffect(() => {
        loadStats();
        loadTeams();
        loadIndividualParticipants();
    }, []);

    const loadParticipants = async () => {
        try {
            setLoading(true);
            setNotification({ type: null, message: '' });
            const response = await ParticipantsService.getAll(filters);
            setParticipants(response.data.data.participants);
            setPagination(response.data.data.pagination);
        } catch (e) {
            setNotification({ type: 'error', message: e.response?.data?.message || 'Ошибка загрузки участников' });
        } finally {
            setLoading(false);
        }
    };

    // Загрузка всех команд отдельно (независимо от фильтров)
    const loadTeams = async () => {
        try {
            const response = await TeamService.getAllTeams();
            const teamsData = response.data.data;
            
            // Форматируем данные команд
            const formattedTeams = teamsData.map(team => ({
                id: team.id,
                name: team.name,
                members: team.members || [],
                memberCount: team.memberCount || team.members?.length || 0
            }));
            
            setTeams(formattedTeams);
        } catch (e) {
            console.error('Ошибка загрузки команд:', e);
            // Если не получилось загрузить, не показываем ошибку пользователю
            // Команды просто не будут отображаться
        }
    };

    const loadStats = async () => {
        try {
            const response = await ParticipantsService.getStats();
            setStats(response.data.data);
        } catch (e) {
            console.error('Ошибка загрузки статистики:', e);
        }
    };

    // Загрузка индивидуальных участников
    const loadIndividualParticipants = async () => {
        try {
            const response = await ParticipantsService.getAll({ 
                participation_format: 'individual',
                limit: 1000, // Загружаем всех индивидуальных участников
                sortBy: 'last_name',
                sortOrder: 'ASC'
            });
            setIndividualParticipants(response.data.data.participants);
        } catch (e) {
            console.error('Ошибка загрузки индивидуальных участников:', e);
        }
    };

    const handleExport = async () => {
        try {
            setExporting(true);
            setNotification({ type: null, message: '' });
            const response = await ParticipantsService.exportToExcel();
            
            // Создаем ссылку для скачивания файла
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const date = new Date().toISOString().split('T')[0];
            link.setAttribute('download', `Участники_IT-Высотка_${date}.xlsx`);
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

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1 // Сбрасываем на первую страницу при изменении фильтров
        }));
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const handleSort = (field) => {
        setFilters(prev => ({
            ...prev,
            sortBy: field,
            sortOrder: prev.sortBy === field && prev.sortOrder === 'ASC' ? 'DESC' : 'ASC'
        }));
    };

    // Переключение раскрытия команды
    const toggleTeamExpand = (teamId) => {
        setExpandedTeams(prev => {
            const newSet = new Set(prev);
            if (newSet.has(teamId)) {
                newSet.delete(teamId);
            } else {
                newSet.add(teamId);
            }
            return newSet;
        });
    };

    // Начать редактирование места
    const handleStartEditPlace = (participant) => {
        setEditingPlace(participant.id);
        setPlaceValue(participant.place || '');
    };

    // Сохранить место
    const handleSavePlace = async (participantId) => {
        try {
            const place = placeValue.trim() === '' ? null : parseInt(placeValue);
            
            if (place !== null && (isNaN(place) || place < 1 || place > 3)) {
                setNotification({ type: 'error', message: 'Место должно быть 1, 2, 3 или пусто' });
                return;
            }

            await ParticipantsService.updatePlace(participantId, place);
            
            // Обновляем список участников
            setParticipants(prev => prev.map(p => 
                p.id === participantId ? { ...p, place } : p
            ));

            // Обновляем индивидуальных участников если это активная вкладка
            if (activeTab === 'individual') {
                setIndividualParticipants(prev => prev.map(p => 
                    p.id === participantId ? { ...p, place } : p
                ));
            }

            setNotification({ 
                type: 'success', 
                message: place ? `Место ${place} назначено` : 'Место снято'
            });
            setEditingPlace(null);
            setPlaceValue('');
        } catch (e) {
            setNotification({ 
                type: 'error', 
                message: e.response?.data?.message || 'Ошибка обновления места' 
            });
        }
    };

    // Отменить редактирование места
    const handleCancelEditPlace = () => {
        setEditingPlace(null);
        setPlaceValue('');
    };

    // Удалить место
    const handleDeletePlace = async (participantId) => {
        try {
            await ParticipantsService.updatePlace(participantId, null);
            
            // Обновляем список участников
            setParticipants(prev => prev.map(p => 
                p.id === participantId ? { ...p, place: null } : p
            ));

            // Обновляем индивидуальных участников если это активная вкладка
            if (activeTab === 'individual') {
                setIndividualParticipants(prev => prev.map(p => 
                    p.id === participantId ? { ...p, place: null } : p
                ));
            }

            setNotification({ 
                type: 'success', 
                message: 'Место удалено'
            });
        } catch (e) {
            setNotification({
                type: 'error',
                message: e.response?.data?.message || 'Ошибка при удалении места'
            });
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Участники</h1>
                    <p className="admin-page-subtitle">Управление зарегистрированными участниками</p>
                </div>
                <button 
                    className="btn btn-primary btn-with-icon"
                    onClick={handleExport}
                    disabled={exporting}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    {exporting ? 'Экспорт...' : 'Экспорт в Excel'}
                </button>
            </div>


            {/* Статистика */}
            {stats && (
                <div className="admin-stats-grid" style={{ marginBottom: '2rem' }}>
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
                            <div className="admin-stat-value">{stats.total}</div>
                            <div className="admin-stat-description">Активировано: {stats.activated}</div>
                        </div>
                    </div>

                    <div className="admin-stat-card">
                        <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <line x1="19" y1="8" x2="19" y2="14"/>
                                <line x1="22" y1="11" x2="16" y2="11"/>
                            </svg>
                        </div>
                        <div className="admin-stat-content">
                            <div className="admin-stat-label">Команды</div>
                            <div className="admin-stat-value">{stats.totalTeams}</div>
                        </div>
                    </div>

                    <div className="admin-stat-card">
                        <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                <polyline points="9 22 9 12 15 12 15 22"/>
                            </svg>
                        </div>
                        <div className="admin-stat-content">
                            <div className="admin-stat-label">В командах</div>
                            <div className="admin-stat-value">{stats.withTeam}</div>
                            <div className="admin-stat-description">Без команды: {stats.withoutTeam}</div>
                        </div>
                    </div>

                    {stats.byParticipationFormat && stats.byParticipationFormat.length > 0 && (
                        <div className="admin-stat-card">
                            <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="7" height="7"/>
                                    <rect x="14" y="3" width="7" height="7"/>
                                    <rect x="14" y="14" width="7" height="7"/>
                                    <rect x="3" y="14" width="7" height="7"/>
                                </svg>
                            </div>
                            <div className="admin-stat-content">
                                <div className="admin-stat-label">Формат участия</div>
                                <div className="admin-stat-value">
                                    {stats.byParticipationFormat.find(f => f.participation_format === 'individual')?.count || 0} / {stats.byParticipationFormat.find(f => f.participation_format === 'team')?.count || 0}
                                </div>
                                <div className="admin-stat-description">Индивид. / Команд.</div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Вкладки */}
            <div className="tabs" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <button 
                    className={`tab-button ${activeTab === 'participants' ? 'active' : ''}`}
                    onClick={() => setActiveTab('participants')}
                >
                    Участники
                </button>
                <button 
                    className={`tab-button ${activeTab === 'teams' ? 'active' : ''}`}
                    onClick={() => setActiveTab('teams')}
                >
                    Команды
                </button>
                <button 
                    className={`tab-button ${activeTab === 'individual' ? 'active' : ''}`}
                    onClick={() => setActiveTab('individual')}
                >
                    Индивидуальные
                </button>
            </div>

            {/* Контент вкладок */}
            <div className="tab-content">
                {activeTab === 'participants' && (
                    <>
                        {/* Фильтры */}
            <div className="participants-filters">
                <input
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
                    {[...Array(11)].map((_, i) => (
                        <option key={i} value={i + 1}>{i + 1} класс</option>
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

                <button
                    className="btn btn-outline"
                    onClick={() => setFilters({
                        page: 1,
                        limit: 20,
                        search: '',
                        region: '',
                        grade: '',
                        programming_language: '',
                        hasTeam: '',
                        participation_format: '',
                        sortBy: 'id',
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
                                    <th style={{ width: '30px', textAlign: 'center', padding: '8px 0px 8px 12px' }}></th>
                                    <th onClick={() => handleSort('last_name')}>
                                        ФИО {filters.sortBy === 'last_name' && (filters.sortOrder === 'ASC' ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => handleSort('email')} style={{ maxWidth: '200px' }}>
                                        Email {filters.sortBy === 'email' && (filters.sortOrder === 'ASC' ? '↑' : '↓')}
                                    </th>
                                    <th>Класс</th>
                                    <th>Школа</th>
                                    <th>Команда / Формат</th>
                                    <th style={{ width: '100px', textAlign: 'center' }}>Место</th>
                                </tr>
                            </thead>
                            <tbody>
                                {participants.map((participant) => (
                                    <tr key={participant.id}>
                                        <td style={{ textAlign: 'center', padding: '8px 0px 8px 12px', width: '30px' }}>
                                            <span style={{
                                                display: 'inline-block',
                                                width: '10px',
                                                height: '10px',
                                                borderRadius: '50%',
                                                backgroundColor: participant.isActivated ? '#10b981' : '#ef4444'
                                            }} title={participant.isActivated ? 'Активирован' : 'Не активирован'}></span>
                                        </td>
                                        <td>
                                            <div className="participant-name">
                                                {participant.last_name} {participant.first_name}
                                                {participant.isLead && (
                                                    <span className="badge badge-lead">Лидер</span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {participant.email}
                                        </td>
                                        <td>{participant.grade}</td>
                                        <td style={{ fontSize: 'var(--font-size-sm)' }}>
                                            {participant.school || '-'}
                                        </td>
                                        <td>
                                            {participant.participation_format === 'individual' ? (
                                                <span className="badge badge-info">Индивидуальный</span>
                                            ) : participant.Team ? (
                                                <span className="badge badge-team">{participant.Team.name}</span>
                                            ) : (
                                                <span className="badge badge-no-team">Нет команды</span>
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            {editingPlace === participant.id ? (
                                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', justifyContent: 'center' }}>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="3"
                                                        value={placeValue}
                                                        onChange={(e) => setPlaceValue(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleSavePlace(participant.id);
                                                            if (e.key === 'Escape') handleCancelEditPlace();
                                                        }}
                                                        placeholder="1-3"
                                                        style={{ 
                                                            width: '50px', 
                                                            padding: '4px 8px',
                                                            fontSize: 'var(--font-size-sm)',
                                                            border: '1px solid var(--border-color)',
                                                            borderRadius: 'var(--border-radius-sm)'
                                                        }}
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => handleSavePlace(participant.id)}
                                                        className="btn btn-sm btn-primary"
                                                        style={{ padding: '4px 8px', minWidth: 'auto' }}
                                                        title="Сохранить"
                                                    >
                                                        ✓
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEditPlace}
                                                        className="btn btn-sm btn-outline"
                                                        style={{ padding: '4px 8px', minWidth: 'auto' }}
                                                        title="Отмена"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ) : (
                                                <div 
                                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                                >
                                                    {participant.place ? (
                                                        <>
                                                            <span 
                                                                className="badge" 
                                                                style={{
                                                                    background: participant.place === 1 ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)' :
                                                                               participant.place === 2 ? 'linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%)' :
                                                                               'linear-gradient(135deg, #cd7f32 0%, #e6a857 100%)',
                                                                    color: participant.place === 1 ? '#b8860b' :
                                                                           participant.place === 2 ? '#696969' :
                                                                           '#8b4513',
                                                                    fontWeight: 'bold',
                                                                    padding: '4px 12px',
                                                                    fontSize: 'var(--font-size-sm)',
                                                                    cursor: 'pointer'
                                                                }}
                                                                onClick={() => handleStartEditPlace(participant)}
                                                                title="Нажмите для редактирования"
                                                            >
                                                                {participant.place} место
                                                            </span>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeletePlace(participant.id);
                                                                }}
                                                                className="btn btn-sm btn-outline"
                                                                style={{ 
                                                                    padding: '4px 8px', 
                                                                    minWidth: 'auto',
                                                                    color: '#dc2626',
                                                                    borderColor: '#dc2626'
                                                                }}
                                                                title="Удалить место"
                                                            >
                                                                ✕
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span 
                                                            style={{ 
                                                                color: 'var(--text-secondary)', 
                                                                fontSize: 'var(--font-size-sm)',
                                                                cursor: 'pointer'
                                                            }}
                                                            onClick={() => handleStartEditPlace(participant)}
                                                        >
                                                            Назначить
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Пагинация */}
                    {pagination.totalPages > 1 && (
                        <div className="pagination">
                            <button
                                className="btn btn-outline btn-sm"
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                            >
                                ← Назад
                            </button>

                            <span className="pagination-info">
                                Страница {pagination.page} из {pagination.totalPages}
                                {' '}
                                (Всего: {pagination.total})
                            </span>

                            <button
                                className="btn btn-outline btn-sm"
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                            >
                                Вперед →
                            </button>
                        </div>
                    )}
                </>
            )}
                    </>
                )}

                {activeTab === 'teams' && (
                    <>
                        {teams.length === 0 ? (
                            <div className="admin-placeholder">
                                <div className="admin-placeholder-icon">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="8" r="7"/>
                                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                                    </svg>
                                </div>
                                <h2>Команды не найдены</h2>
                                <p>Пока нет созданных команд</p>
                            </div>
                        ) : (
                            <div className="admin-section">
                                <div className="teams-table-container">
                                    <table className="teams-table">
                                        <thead>
                                            <tr>
                                                <th>Название команды</th>
                                                <th>Участников</th>
                                                <th>Школа</th>
                                                <th>Эссе</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {teams.map((team) => {
                                                const isExpanded = expandedTeams.has(team.id);
                                                const leader = team.members.find(m => m.isLead) || team.members[0];
                                                const school = leader?.school || 'Неизвестно';
                                                const essayUrl = leader?.essayUrl;
                                                
                                                return (
                                                    <React.Fragment key={team.id}>
                                                        <tr 
                                                            className={`team-row ${isExpanded ? 'expanded' : ''}`}
                                                        >
                                                            <td 
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={() => toggleTeamExpand(team.id)}
                                                            >
                                                                <strong>{team.name}</strong>
                                                            </td>
                                                            <td 
                                                                onClick={() => toggleTeamExpand(team.id)}
                                                                style={{ cursor: 'pointer' }}
                                                            >
                                                                <span className="badge badge-team">
                                                                    {team.members.length} {team.members.length === 1 ? 'участник' : team.members.length < 5 ? 'участника' : 'участников'}
                                                                </span>
                                                            </td>
                                                            <td 
                                                                onClick={() => toggleTeamExpand(team.id)}
                                                                style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}
                                                            >
                                                                {school}
                                                            </td>
                                                            <td onClick={(e) => e.stopPropagation()}>
                                                                {essayUrl ? (
                                                                    <a 
                                                                        href={essayUrl} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer"
                                                                        className="btn btn-sm btn-outline"
                                                                        style={{ padding: '4px 12px', fontSize: '0.875rem' }}
                                                                    >
                                                                        Эссе
                                                                    </a>
                                                                ) : (
                                                                    <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>-</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                        {isExpanded && (
                                                            <tr className="team-members-row">
                                                                <td colSpan="4">
                                                                    <div className="team-members-expanded">
                                                                        <div className="team-members-grid">
                                                                            {team.members.map((member) => (
                                                                                <div key={member.id} className={`team-member-card ${member.isLead ? 'team-member-lead' : ''}`}>
                                                                                    <div className="team-member-card-body">
                                                                                        <div className="team-member-card-name">
                                                                                            <span>
                                                                                                {member.last_name} {member.first_name}
                                                                                            </span>
                                                                                            {member.isLead && (
                                                                                                <span className="badge badge-lead" style={{ marginLeft: 'var(--spacing-sm)' }}>Лидер</span>
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="team-member-card-info">
                                                                                            <div className="team-member-card-detail">
                                                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}>
                                                                                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                                                                                    <polyline points="22,6 12,13 2,6"/>
                                                                                                </svg>
                                                                                                {member.email || '-'}
                                                                                            </div>
                                                                            <div className="team-member-card-detail">
                                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}>
                                                                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                                                                    <circle cx="12" cy="7" r="4"/>
                                                                                </svg>
                                                                                {member.grade ? `${member.grade} класс` : '-'}
                                                                            </div>
                                                                            <div className="team-member-card-detail">
                                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}>
                                                                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                                                                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                                                                                </svg>
                                                                                {member.school || '-'}
                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'individual' && (
                    <>
                        {individualParticipants.length === 0 ? (
                            <div className="admin-placeholder">
                                <div className="admin-placeholder-icon">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                        <circle cx="12" cy="7" r="4"/>
                                    </svg>
                                </div>
                                <h2>Индивидуальные участники не найдены</h2>
                                <p>Пока нет участников с индивидуальным форматом участия</p>
                            </div>
                        ) : (
                            <div className="participants-table-container">
                                <table className="participants-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '30px', textAlign: 'center', padding: '8px 0px 8px 12px' }}></th>
                                            <th>ФИО</th>
                                            <th style={{ maxWidth: '200px' }}>Email</th>
                                            <th>Класс</th>
                                            <th>Школа</th>
                                            <th style={{ width: '80px', textAlign: 'center' }}>Эссе</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {individualParticipants.map((participant) => (
                                            <tr key={participant.id}>
                                                <td style={{ textAlign: 'center', padding: '8px 0px 8px 12px', width: '30px' }}>
                                                    <span style={{
                                                        display: 'inline-block',
                                                        width: '10px',
                                                        height: '10px',
                                                        borderRadius: '50%',
                                                        backgroundColor: participant.isActivated ? '#10b981' : '#ef4444'
                                                    }} title={participant.isActivated ? 'Активирован' : 'Не активирован'}></span>
                                                </td>
                                                <td>
                                                    <div className="participant-name">
                                                        {participant.last_name} {participant.first_name} {participant.second_name}
                                                    </div>
                                                </td>
                                                <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {participant.email}
                                                </td>
                                                <td>{participant.grade} класс</td>
                                                <td style={{ fontSize: 'var(--font-size-sm)' }}>
                                                    {participant.school || '-'}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    {participant.essayUrl ? (
                                                        <a 
                                                            href={participant.essayUrl} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="btn btn-sm btn-outline"
                                                            style={{ padding: '4px 12px', fontSize: '0.875rem' }}
                                                        >
                                                            Эссе
                                                        </a>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>

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

export default Participants;

