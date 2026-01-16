import React, { useState, useEffect } from 'react';
import ParticipantsService from '../../services/ParticipantsService';

const Participants = () => {
    const [participants, setParticipants] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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

    // Загрузка статистики один раз при монтировании
    useEffect(() => {
        loadStats();
    }, []);

    const loadParticipants = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await ParticipantsService.getAll(filters);
            setParticipants(response.data.data.participants);
            setPagination(response.data.data.pagination);
        } catch (e) {
            setError(e.response?.data?.message || 'Ошибка загрузки участников');
        } finally {
            setLoading(false);
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

    const handleExport = async () => {
        try {
            setExporting(true);
            setError('');
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
            
            setSuccess('Файл успешно скачан!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (e) {
            setError(e.response?.data?.message || 'Ошибка экспорта');
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

            {/* Уведомления */}
            {error && (
                <div className="alert alert-error">{error}</div>
            )}
            {success && (
                <div className="alert alert-success">{success}</div>
            )}

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
                            <div className="admin-stat-label">В командах</div>
                            <div className="admin-stat-value">{stats.withTeam}</div>
                            <div className="admin-stat-description">Без команды: {stats.withoutTeam}</div>
                        </div>
                    </div>

                    <div className="admin-stat-card">
                        <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="8" r="7"/>
                                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                            </svg>
                        </div>
                        <div className="admin-stat-content">
                            <div className="admin-stat-label">Команды</div>
                            <div className="admin-stat-value">{stats.totalTeams}</div>
                            <div className="admin-stat-description">Создано команд</div>
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
                    value={filters.programming_language}
                    onChange={(e) => handleFilterChange('programming_language', e.target.value)}
                    className="form-select"
                >
                    <option value="">Все языки</option>
                    <option value="C++">C++</option>
                    <option value="Python">Python</option>
                    <option value="Java">Java</option>
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
                                    <th onClick={() => handleSort('id')}>
                                        № {filters.sortBy === 'id' && (filters.sortOrder === 'ASC' ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => handleSort('last_name')}>
                                        ФИО {filters.sortBy === 'last_name' && (filters.sortOrder === 'ASC' ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => handleSort('email')}>
                                        Email {filters.sortBy === 'email' && (filters.sortOrder === 'ASC' ? '↑' : '↓')}
                                    </th>
                                    <th>Телефон</th>
                                    <th onClick={() => handleSort('grade')}>
                                        Класс {filters.sortBy === 'grade' && (filters.sortOrder === 'ASC' ? '↑' : '↓')}
                                    </th>
                                    <th>Язык</th>
                                    <th>Формат участия</th>
                                    <th>Команда</th>
                                    <th>Статус</th>
                                </tr>
                            </thead>
                            <tbody>
                                {participants.map((participant) => (
                                    <tr key={participant.id}>
                                        <td>{participant.id}</td>
                                        <td>
                                            <div className="participant-name">
                                                {participant.last_name} {participant.first_name}
                                                {participant.isLead && (
                                                    <span className="badge badge-lead">Лидер</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>{participant.email}</td>
                                        <td>{participant.phone}</td>
                                        <td>{participant.grade}</td>
                                        <td>{participant.programming_language}</td>
                                        <td>
                                            <span className={`badge ${participant.participation_format === 'individual' ? 'badge-info' : 'badge-primary'}`}>
                                                {participant.participation_format === 'individual' ? 'Индивидуальное' : 'Командное'}
                                            </span>
                                        </td>
                                        <td>
                                            {participant.Team ? (
                                                <span className="badge badge-team">{participant.Team.name}</span>
                                            ) : (
                                                <span className="badge badge-no-team">Без команды</span>
                                            )}
                                        </td>
                                        <td>
                                            {participant.isActivated ? (
                                                <span className="badge badge-success">Активирован</span>
                                            ) : (
                                                <span className="badge badge-warning">Не активирован</span>
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
        </div>
    );
};

export default Participants;

