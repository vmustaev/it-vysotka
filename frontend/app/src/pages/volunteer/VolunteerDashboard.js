import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Context } from "../../index";
import AttendanceService from '../../services/AttendanceService';

const VolunteerDashboard = () => {
    const { store } = useContext(Context);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showInfoModal, setShowInfoModal] = useState(false);

    useEffect(() => {
        loadStatistics();
    }, []);

    const loadStatistics = async () => {
        try {
            setError(null);
            const response = await AttendanceService.getStatistics();
            setStatistics(response.data.data);
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
            setError('Не удалось загрузить статистику');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Панель волонтера</h1>
                    <p className="admin-page-subtitle">
                        Добро пожаловать в панель волонтера!
                    </p>
                </div>
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
            </div>

            {error && (
                <div style={{
                    padding: 'var(--spacing-md)',
                    marginBottom: 'var(--spacing-lg)',
                    backgroundColor: '#fee2e2',
                    border: '1px solid #ef4444',
                    borderRadius: 'var(--border-radius)',
                    color: '#991b1b'
                }}>
                    {error}
                    <button 
                        onClick={loadStatistics}
                        className="btn btn-sm btn-primary"
                        style={{ marginLeft: 'var(--spacing-md)' }}
                    >
                        Попробовать снова
                    </button>
                </div>
            )}

            {loading ? (
                <div className="admin-loading">
                    <div className="spinner"></div>
                    <p>Загрузка статистики...</p>
                </div>
            ) : statistics && (
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
                            <div className="admin-stat-label">Всего участников</div>
                            <div className="admin-stat-value">{statistics.totalParticipants}</div>
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
                            <div className="admin-stat-value">{statistics.presentParticipants}</div>
                            <div className="admin-stat-description">
                                {statistics.attendanceRate}% явка
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
                            <div className="admin-stat-value">{statistics.absentParticipants}</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="admin-section">
                <h2 className="admin-section-title">Быстрые действия</h2>
                <div className="admin-quick-actions">
                    <Link to="/volunteer/attendance" className="admin-quick-action-card">
                        <div className="admin-quick-action-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                        </div>
                        <div className="admin-quick-action-content">
                            <h3>Отметка присутствия</h3>
                            <p>Отмечайте участников, которые пришли на чемпионат</p>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Модальное окно с инструкцией */}
            {showInfoModal && (
                <div className="modal-overlay" onClick={() => setShowInfoModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
                        <div className="modal-header" style={{ marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>Инструкция для волонтеров</h2>
                            <button 
                                className="modal-close"
                                onClick={() => setShowInfoModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div style={{ lineHeight: '1.8' }}>
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ 
                                    color: '#0f172a', 
                                    fontSize: '1.25rem', 
                                    marginBottom: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <span style={{ 
                                        display: 'inline-flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        fontSize: '0.875rem',
                                        fontWeight: 'bold'
                                    }}>1</span>
                                    Как отметить присутствие участника?
                                </h3>
                                <div style={{ paddingLeft: '2.5rem', color: '#475569' }}>
                                    <p style={{ marginBottom: '0.5rem' }}>
                                        <strong>Шаг 1:</strong> Перейдите в раздел <strong>"Отметка присутствия"</strong> (кнопка выше или в меню слева).
                                    </p>
                                    <p style={{ marginBottom: '0.5rem' }}>
                                        <strong>Шаг 2:</strong> Найдите участника в таблице. Вы можете использовать фильтры:
                                    </p>
                                    <ul style={{ marginLeft: '1.5rem', marginBottom: '0.5rem' }}>
                                        <li>Выбрать конкретный кабинет из списка</li>
                                        <li>Ввести ФИО, школу или название команды в поле поиска</li>
                                    </ul>
                                    <p style={{ marginBottom: '0.5rem' }}>
                                        <strong>Шаг 3:</strong> Нажмите на кнопку <strong style={{ color: '#ef4444' }}>"Отсутствует"</strong> рядом с участником.
                                    </p>
                                    <p>
                                        Кнопка изменится на <strong style={{ color: '#10b981' }}>"Присутствует"</strong> – это значит, что участник отмечен как пришедший!
                                    </p>
                                </div>
                            </div>

                            <div style={{ marginBottom: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                                <h3 style={{ 
                                    color: '#0f172a', 
                                    fontSize: '1.25rem', 
                                    marginBottom: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <span style={{ 
                                        display: 'inline-flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        color: 'white',
                                        fontSize: '0.875rem',
                                        fontWeight: 'bold'
                                    }}>2</span>
                                    Как распечатать посадочные листы?
                                </h3>
                                <div style={{ paddingLeft: '2.5rem', color: '#475569' }}>
                                    <p style={{ marginBottom: '0.5rem' }}>
                                        После того, как вы отметили всех пришедших участников, можно распечатать посадочные листы:
                                    </p>
                                    <p style={{ marginBottom: '0.5rem' }}>
                                        <strong>Шаг 1:</strong> В разделе "Отметка присутствия" нажмите кнопку <strong style={{ color: '#8b5cf6' }}>"Посадочные листы (Excel)"</strong> в правом верхнем углу.
                                    </p>
                                    <p style={{ marginBottom: '0.5rem' }}>
                                        <strong>Шаг 2:</strong> Файл автоматически скачается. В нём будут только те участники, которые отмечены как <strong>присутствующие</strong>.
                                    </p>
                                    <p>
                                        <strong>Важно:</strong> В посадочных листах участники сгруппированы по командам, и для каждого кабинета создан отдельный лист. Это удобно для печати!
                                    </p>
                                </div>
                            </div>

                            <div style={{ marginBottom: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                                <h3 style={{ 
                                    color: '#0f172a', 
                                    fontSize: '1.25rem', 
                                    marginBottom: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <span style={{ 
                                        display: 'inline-flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                        color: 'white',
                                        fontSize: '0.875rem',
                                        fontWeight: 'bold'
                                    }}>3</span>
                                    Как редактировать данные участника?
                                </h3>
                                <div style={{ paddingLeft: '2.5rem', color: '#475569' }}>
                                    <p style={{ marginBottom: '0.5rem' }}>
                                        Если участник сообщил об ошибке в своих данных (неправильное ФИО, телефон, школа и т.д.), вы можете исправить их:
                                    </p>
                                    <p style={{ marginBottom: '0.5rem' }}>
                                        <strong>Шаг 1:</strong> Перейдите в раздел <strong>"Редактирование участников"</strong> в меню слева.
                                    </p>
                                    <p style={{ marginBottom: '0.5rem' }}>
                                        <strong>Шаг 2:</strong> Найдите участника с помощью поиска или фильтров (по классу, формату участия и т.д.).
                                    </p>
                                    <p style={{ marginBottom: '0.5rem' }}>
                                        <strong>Шаг 3:</strong> Нажмите кнопку <strong style={{ color: '#3b82f6' }}>"Редактировать"</strong> рядом с участником.
                                    </p>
                                    <p style={{ marginBottom: '0.5rem' }}>
                                        <strong>Шаг 4:</strong> В открывшемся окне исправьте нужные данные и нажмите <strong>"Сохранить"</strong>.
                                    </p>
                                    <p style={{ marginBottom: '0.5rem' }}>
                                        <strong>Важно:</strong> 
                                    </p>
                                    <ul style={{ marginLeft: '1.5rem', marginBottom: '0.5rem' }}>
                                        <li>В колонке "История" вы можете увидеть, были ли изменения в данных участника ранее</li>
                                        <li>Если есть история изменений, нажмите на <strong style={{ color: '#3b82f6' }}>"Есть изменения"</strong>, чтобы просмотреть, кто и когда вносил изменения</li>
                                        <li>Кнопка "Редактировать" будет синей, если у участника есть история изменений, и серой, если изменений не было</li>
                                        <li>Все изменения сохраняются в истории, чтобы можно было отследить, кто и когда внёс правки</li>
                                    </ul>
                                </div>
                            </div>

                            <div style={{ marginBottom: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                                <h3 style={{ 
                                    color: '#0f172a', 
                                    fontSize: '1.25rem', 
                                    marginBottom: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <span style={{ 
                                        display: 'inline-flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                                        color: 'white',
                                        fontSize: '0.875rem',
                                        fontWeight: 'bold'
                                    }}>4</span>
                                    Что делать, если два волонтера работают одновременно?
                                </h3>
                                <div style={{ paddingLeft: '2.5rem', color: '#475569' }}>
                                    <p style={{ marginBottom: '0.5rem' }}>
                                        Если вы и другой волонтер отмечаете участников одновременно:
                                    </p>
                                    <p style={{ marginBottom: '0.5rem' }}>
                                        <strong>•</strong> Если вы попытаетесь отметить участника, который уже отмечен другим волонтером, появится <strong style={{ color: '#f59e0b' }}>желтое предупреждение</strong>.
                                    </p>
                                    <p style={{ marginBottom: '0.5rem' }}>
                                        <strong>•</strong> Это нормально! Просто продолжайте отмечать других участников.
                                    </p>
                                    <p>
                                        <strong>•</strong> Система автоматически обновит список, и вы увидите актуальное состояние.
                                    </p>
                                </div>
                            </div>

                            <div style={{ 
                                paddingTop: '1.5rem', 
                                borderTop: '1px solid #e2e8f0',
                                background: '#f8fafc',
                                padding: '1.5rem',
                                borderRadius: '8px',
                                marginTop: '1rem'
                            }}>
                                <h3 style={{ 
                                    color: '#0f172a', 
                                    fontSize: '1.1rem', 
                                    marginBottom: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                        <polyline points="22 4 12 14.01 9 11.01"/>
                                    </svg>
                                    Полезные советы
                                </h3>
                                <ul style={{ marginLeft: '1.5rem', color: '#475569', lineHeight: '1.8' }}>
                                    <li>Используйте фильтр по кабинету, чтобы быстро найти участников из нужной аудитории</li>
                                    <li>Поиск работает по ФИО, школе и названию команды – введите любую часть</li>
                                    <li>Статистика вверху страницы показывает общее количество пришедших участников</li>
                                    <li>Если случайно отметили не того участника – просто нажмите кнопку ещё раз, чтобы снять отметку</li>
                                    <li>При редактировании данных участника поле поиска сохраняет фокус, вы можете продолжать вводить текст</li>
                                    <li>История изменений показывает, кто и когда вносил правки в данные участника</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VolunteerDashboard;

