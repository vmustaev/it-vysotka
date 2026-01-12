import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Context } from "../index";
import TeamService from '../services/TeamService';
import UserService from '../services/UserService';
import '../styles/profile.css';

const Profile = () => {
    const { store } = useContext(Context);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [teamName, setTeamName] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
        // Обработка query параметров после присоединения к команде
        const joined = searchParams.get('joined');
        const joinError = searchParams.get('join_error');
        
        if (joined === 'true') {
            setSuccess('Вы успешно присоединились к команде!');
            setSearchParams({}, { replace: true }); // Очищаем query параметры
            // Обновляем данные пользователя
            if (store.isAuth) {
                store.checkAuth().then(() => {
                    loadData();
                });
            }
            return; // Выходим, чтобы не вызывать loadData дважды
        }
        
        if (joinError) {
            const errorMsg = decodeURIComponent(joinError);
            setError(errorMsg);
            setSearchParams({}, { replace: true }); // Очищаем query параметры
        }

        if (store.isAuth && store.user && store.user.id) {
            loadData();
        } else if (!store.isLoading) {
            // Если не загружается и не авторизован, просто показываем пустой профиль
            setLoading(false);
        }
    }, [store.isAuth, store.user?.id, store.isLoading, searchParams, setSearchParams]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError('');
            
            // Загружаем информацию о команде, если пользователь в команде
            if (store.user && store.user.teamId) {
                const response = await TeamService.getMyTeam();
                setTeam(response.data.id ? response.data : null);
            } else {
                setTeam(null);
            }
        } catch (e) {
            console.error(e);
            setTeam(null);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!teamName.trim()) {
            setError('Введите название команды');
            return;
        }

        try {
            const response = await TeamService.createTeam(teamName);
            setTeam(response.data);
            setTeamName('');
            setShowCreateForm(false);
            setSuccess('Команда успешно создана!');
            // Обновляем данные пользователя через checkAuth
            if (store.isAuth) {
                await store.checkAuth();
            }
        } catch (e) {
            if (e.response?.data?.errors) {
                const errors = e.response.data.errors;
                if (errors.name) {
                    setError(errors.name[0]);
                } else if (Array.isArray(errors)) {
                    setError(errors[0]);
                } else {
                    setError(e.response.data.message || 'Ошибка создания команды');
                }
            } else {
                setError(e.response?.data?.message || 'Ошибка создания команды');
            }
        }
    };

    const handleLeaveTeam = async () => {
        if (!window.confirm('Вы уверены, что хотите покинуть команду?')) {
            return;
        }

        try {
            await TeamService.leaveTeam();
            setTeam(null);
            setSuccess('Вы успешно покинули команду');
            // Обновляем данные пользователя через checkAuth
            if (store.isAuth) {
                await store.checkAuth();
            }
        } catch (e) {
            setError(e.response?.data?.message || 'Ошибка при выходе из команды');
        }
    };

    const handleKickMember = async (userId) => {
        if (!window.confirm('Вы уверены, что хотите исключить этого участника?')) {
            return;
        }

        try {
            await TeamService.kickMember(userId);
            await loadData();
            setSuccess('Участник исключен из команды');
        } catch (e) {
            setError(e.response?.data?.message || 'Ошибка при исключении участника');
        }
    };

    const handleDeleteTeam = async () => {
        if (!window.confirm('Вы уверены, что хотите удалить команду? Это действие необратимо!')) {
            return;
        }

        try {
            await TeamService.deleteTeam();
            setTeam(null);
            setSuccess('Команда успешно удалена');
            // Обновляем данные пользователя через checkAuth
            if (store.isAuth) {
                await store.checkAuth();
            }
        } catch (e) {
            setError(e.response?.data?.message || 'Ошибка при удалении команды');
        }
    };

    const copyInviteLink = () => {
        navigator.clipboard.writeText(team.inviteLink);
        setSuccess('Ссылка скопирована в буфер обмена!');
        setTimeout(() => setSuccess(''), 3000);
    };

    if (loading || store.isLoading) {
        return <div className="loading">Загрузка...</div>;
    }

    if (!store.isAuth || !store.user || !store.user.id) {
        return (
            <div className="page">
                <div className="page-content">
                    <div className="alert alert-error">
                        Вы не авторизованы. Пожалуйста, войдите в систему.
                    </div>
                </div>
            </div>
        );
    }

    const user = store.user;
    const isLead = user && user.isLead;

    return (
        <div className="page">
            <div className="page-content">
                <div className="page-header">
                    <h1 className="page-title">Профиль</h1>
                    <p className="page-subtitle">
                        Ваша личная информация и команда
                    </p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                {/* Информация о пользователе */}
                <div className="section">
                    <h2 className="section-title">Личная информация</h2>
                    <div className="profile-info-card">
                        <div className="profile-row">
                            <span className="profile-label">ФИО:</span>
                            <span className="profile-value">{user.last_name} {user.first_name} {user.second_name}</span>
                        </div>
                        <div className="profile-row">
                            <span className="profile-label">Email:</span>
                            <span className="profile-value">{user.email}</span>
                        </div>
                    </div>
                </div>

                {/* Информация о команде */}
                <div className="section">
                    <h2 className="section-title">Моя команда</h2>
                    
                    {!team ? (
                        <div className="team-empty">
                            <p>Вы не состоите в команде</p>
                            
                            {!showCreateForm ? (
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => setShowCreateForm(true)}
                                >
                                    Создать команду
                                </button>
                            ) : (
                                <div className="team-create-form">
                                    <form onSubmit={handleCreateTeam}>
                                        <div className="form-group">
                                            <label className="form-label">Название команды</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={teamName}
                                                onChange={(e) => setTeamName(e.target.value)}
                                                placeholder="Введите название (только буквы и цифры)"
                                                maxLength={50}
                                            />
                                            <small>От 3 до 50 символов. Можно использовать русские/английские буквы и цифры</small>
                                        </div>
                                        <div className="form-actions">
                                            <button type="submit" className="btn btn-primary">
                                                Создать
                                            </button>
                                            <button 
                                                type="button" 
                                                className="btn btn-secondary"
                                                onClick={() => {
                                                    setShowCreateForm(false);
                                                    setTeamName('');
                                                    setError('');
                                                }}
                                            >
                                                Отмена
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="team-info-card">
                            <div className="team-header">
                                <h3 className="team-name">{team.name}</h3>
                                <span className="team-member-count">{team.memberCount}/3 участников</span>
                            </div>

                            {isLead && (
                                <div className="team-invite">
                                    <h4>Ссылка-приглашение</h4>
                                    <div className="invite-link-container">
                                        <input 
                                            type="text" 
                                            className="form-input" 
                                            value={team.inviteLink} 
                                            readOnly 
                                        />
                                        <button 
                                            className="btn btn-secondary"
                                            onClick={copyInviteLink}
                                        >
                                            Копировать
                                        </button>
                                    </div>
                                    <small>Поделитесь этой ссылкой с друзьями, чтобы они могли присоединиться к команде</small>
                                </div>
                            )}

                            <div className="team-members">
                                <h4>Участники команды</h4>
                                <div className="members-list">
                                    {team.members && team.members.map((member) => (
                                        <div key={member.id} className="member-card">
                                            <div className="member-info">
                                                <div className="member-name">
                                                    {member.last_name} {member.first_name} {member.second_name}
                                                    {member.isLead && (
                                                        <span className="lead-badge">Лидер</span>
                                                    )}
                                                </div>
                                                <div className="member-email">{member.email}</div>
                                            </div>
                                            {isLead && !member.isLead && (
                                                <button 
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleKickMember(member.id)}
                                                >
                                                    Исключить
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="team-actions">
                                {isLead ? (
                                    <button 
                                        className="btn btn-danger"
                                        onClick={handleDeleteTeam}
                                    >
                                        Удалить команду
                                    </button>
                                ) : (
                                    <button 
                                        className="btn btn-danger"
                                        onClick={handleLeaveTeam}
                                    >
                                        Покинуть команду
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
