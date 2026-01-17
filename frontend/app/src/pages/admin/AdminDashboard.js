import React, { useContext, useState, useEffect } from 'react';
import { Context } from "../../index";
import ParticipantsService from '../../services/ParticipantsService';

const AdminDashboard = () => {
    const { store } = useContext(Context);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const response = await ParticipantsService.getStats();
            setStats(response.data.data);
        } catch (e) {
            console.error('Ошибка загрузки статистики:', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <h1 className="admin-page-title">Панель управления</h1>
                <p className="admin-page-subtitle">
                    Добро пожаловать в панель администратора!
                </p>
            </div>

            {loading ? (
                <div className="loading">Загрузка статистики...</div>
            ) : stats && (
                <div className="admin-stats-grid">
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
                            <div className="admin-stat-label">Участники</div>
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
                            <div className="admin-stat-description">Создано команд</div>
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
                            <div className="admin-stat-label">С командой</div>
                            <div className="admin-stat-value">{stats.withTeam}</div>
                            <div className="admin-stat-description">Без команды: {stats.withoutTeam}</div>
                        </div>
                    </div>

                    <div className="admin-stat-card">
                        <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="7" width="20" height="15" rx="2"/>
                                <polyline points="17 2 12 7 7 2"/>
                            </svg>
                        </div>
                        <div className="admin-stat-content">
                            <div className="admin-stat-label">Языки программирования</div>
                            <div className="admin-stat-value">{stats.byLanguage?.length || 0}</div>
                            <div className="admin-stat-description">
                                {stats.byLanguage?.[0] && `Популярный: ${stats.byLanguage[0].programming_language}`}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="admin-section">
                <h2 className="admin-section-title">Быстрые действия</h2>
                <div className="admin-quick-actions">
                    <a href="/admin/participants" className="admin-quick-action-card">
                        <div className="admin-quick-action-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                        </div>
                        <div className="admin-quick-action-content">
                            <h3>Управление участниками</h3>
                            <p>Просмотр и редактирование списка участников</p>
                        </div>
                    </a>

                    <a href="/admin/rooms" className="admin-quick-action-card">
                        <div className="admin-quick-action-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                <polyline points="9 22 9 12 15 12 15 22"/>
                            </svg>
                        </div>
                        <div className="admin-quick-action-content">
                            <h3>Аудитории</h3>
                            <p>Добавление и управление аудиториями</p>
                        </div>
                    </a>

                    <a href="/admin/seating" className="admin-quick-action-card">
                        <div className="admin-quick-action-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="7" width="20" height="15" rx="2"/>
                                <polyline points="17 2 12 7 7 2"/>
                            </svg>
                        </div>
                        <div className="admin-quick-action-content">
                            <h3>Рассадка</h3>
                            <p>Автоматическая и ручная рассадка участников</p>
                        </div>
                    </a>

                    <a href="/admin/settings" className="admin-quick-action-card">
                        <div className="admin-quick-action-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="3"/>
                                <path d="M12 1v6m0 6v6m-7-7h6m6 0h6"/>
                            </svg>
                        </div>
                        <div className="admin-quick-action-content">
                            <h3>Настройки</h3>
                            <p>Управление регистрацией и системой</p>
                        </div>
                    </a>
                </div>
            </div>

            <div className="admin-info-box">
                <div className="admin-info-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="16" x2="12" y2="12"/>
                        <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                </div>
                <div>
                    <h3>Добро пожаловать в панель администратора!</h3>
                    <p>Здесь вы можете управлять участниками, аудиториями, рассадкой и контентом олимпиады IT-Высотка.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

