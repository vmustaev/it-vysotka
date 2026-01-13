import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Context } from "../index";
import TeamService from '../services/TeamService';
import UserService from '../services/UserService';
import ConfirmDialog from '../components/ConfirmDialog';
import '../styles/profile.css';

const Profile = () => {
    const { store } = useContext(Context);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [teamError, setTeamError] = useState('');
    const [teamSuccess, setTeamSuccess] = useState('');
    const [teamName, setTeamName] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null, confirmText: 'Подтвердить', danger: false });

    useEffect(() => {
        document.body.style.overflowY = 'scroll';
        return () => {
            document.body.style.overflowY = '';
        };
    }, []);


    useEffect(() => {
        const joined = searchParams.get('joined');
        const joinError = searchParams.get('join_error');
        
        if (joined === 'true') {
            setTeamSuccess('Вы успешно присоединились к команде!');
            setSearchParams({}, { replace: true });
            if (store.isAuth) {
                store.checkAuth().then(() => {
                    loadData(true);
                });
            }
            return;
        }
        
        if (joinError) {
            const errorMsg = decodeURIComponent(joinError);
            setTeamError(errorMsg);
            setSearchParams({}, { replace: true });
            if (store.isAuth) {
                store.checkAuth().then(() => {
                    loadData(false);
                });
            }
            return;
        }

        if (store.isAuth && store.user && store.user.id && !store.isLoading) {
            loadData();
        }
    }, [store.isAuth, store.user?.id, store.isLoading, searchParams, setSearchParams]);

    const loadData = async (showLoading = false) => {
        try {
            if (showLoading) {
                setLoading(true);
            }
            setError('');
            
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
            if (showLoading) {
                setLoading(false);
            }
        }
    };

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        setTeamError('');
        setTeamSuccess('');

        if (!teamName.trim()) {
            setTeamError('Введите название команды');
            return;
        }

        try {
            const response = await TeamService.createTeam(teamName);
            setTeam(response.data);
            setTeamName('');
            setShowCreateForm(false);
            setTeamSuccess('Команда успешно создана!');
            if (store.isAuth) {
                await store.checkAuth();
            }
        } catch (e) {
            const errorMessage = e.response?.data?.message || '';
            const isAlreadyInTeam = errorMessage.includes('уже состоите в команде') || 
                                   errorMessage.includes('состоите в команде');
            
            if (e.response?.data?.errors) {
                const errors = e.response.data.errors;
                if (errors.name) {
                    setTeamError(errors.name[0]);
                } else if (Array.isArray(errors)) {
                    setTeamError(errors[0]);
                } else {
                    setTeamError(e.response.data.message || 'Ошибка создания команды');
                }
            } else {
                setTeamError(errorMessage || 'Ошибка создания команды');
            }
            
            if (isAlreadyInTeam) {
                if (store.isAuth) {
                    await store.checkAuth();
                }
                await loadData(false);
            }
        }
    };

    const handleLeaveTeam = async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        setConfirmDialog({
            isOpen: true,
            title: 'Покинуть команду',
            message: 'Вы уверены, что хотите покинуть команду?',
            confirmText: 'Покинуть',
            cancelText: 'Отмена',
            danger: true,
            onConfirm: async () => {
                setConfirmDialog({ isOpen: false });
                setTeamError('');
                setTeamSuccess('');

                try {
                    const response = await TeamService.leaveTeam();
                    setTeam(null);
                    const message = response.data?.message || 'Вы успешно покинули команду';
                    if (message.includes('не состоите в команде')) {
                        setTeamSuccess('Команда была удалена капитаном');
                    } else {
                        setTeamSuccess(message);
                    }
                    if (store.isAuth) {
                        await store.checkAuth();
                    }
                    await loadData(true);
                } catch (e) {
                    console.error('Ошибка при выходе из команды:', e);
                    if (e.response?.data?.message?.includes('не состоите в команде')) {
                        setTeam(null);
                        setTeamSuccess('Команда была удалена капитаном');
                        if (store.isAuth) {
                            await store.checkAuth();
                        }
                        await loadData(true);
                    } else {
                        setTeamError(e.response?.data?.message || 'Ошибка при выходе из команды');
                    }
                }
            }
        });
    };

    const handleKickMember = async (userId) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Исключить участника',
            message: 'Вы уверены, что хотите исключить этого участника?',
            confirmText: 'Исключить',
            cancelText: 'Отмена',
            danger: true,
            onConfirm: async () => {
                setConfirmDialog({ isOpen: false });
                setTeamError('');
                setTeamSuccess('');

                try {
                    const response = await TeamService.kickMember(userId);
                    const message = response.data?.message || 'Участник исключен из команды';
                    if (message.includes('уже не состоит') || message.includes('не состоит в команде')) {
                        setTeamSuccess('Участник уже вышел из команды');
                    } else {
                        setTeamSuccess(message);
                    }
                    await loadData(false);
                } catch (e) {
                    console.error('Ошибка при исключении участника:', e);
                    if (e.response?.data?.message?.includes('не состоит в вашей команде')) {
                        setTeamSuccess('Участник уже вышел из команды');
                        await loadData(false);
                    } else {
                        setTeamError(e.response?.data?.message || 'Ошибка при исключении участника');
                    }
                }
            }
        });
    };

    const handleDeleteTeam = async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        setConfirmDialog({
            isOpen: true,
            title: 'Удалить команду',
            message: 'Вы уверены, что хотите удалить команду? Это действие необратимо!',
            confirmText: 'Удалить',
            cancelText: 'Отмена',
            danger: true,
            onConfirm: async () => {
                setConfirmDialog({ isOpen: false });
                setTeamError('');
                setTeamSuccess('');

                try {
                    await TeamService.deleteTeam();
                    setTeam(null);
                    setTeamSuccess('Команда успешно удалена');
                    if (store.isAuth) {
                        await store.checkAuth();
                    }
                    await loadData(true);
                } catch (e) {
                    console.error('Ошибка при удалении команды:', e);
                    setTeamError(e.response?.data?.message || 'Ошибка при удалении команды');
                }
            }
        });
    };

    const copyInviteLink = () => {
        navigator.clipboard.writeText(team.inviteLink);
        setTeamSuccess('Ссылка скопирована в буфер обмена!');
        setTimeout(() => setTeamSuccess(''), 3000);
    };

    if (loading) {
        return (
            <div className="page profile-page">
                <div className="page-content">
                    <div className="loading">Загрузка...</div>
                </div>
            </div>
        );
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
        <div className="page profile-page">
            <div className="page-content">
                <div className="page-header">
                    <h1 className="page-title">Профиль</h1>
                    <p className="page-subtitle">
                        Ваша личная информация и команда
                    </p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

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

                <div className="section">
                    <h2 className="section-title">Моя команда</h2>
                    
                    {!team ? (
                        <div className="team-empty">
                            {teamError && <div className="alert alert-error">{teamError}</div>}
                            {teamSuccess && <div className="alert alert-success">{teamSuccess}</div>}
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
                                                    setTeamError('');
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
                            {teamError && <div className="alert alert-error">{teamError}</div>}
                            {teamSuccess && <div className="alert alert-success">{teamSuccess}</div>}
                            
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
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={handleDeleteTeam}
                                    >
                                        Удалить команду
                                    </button>
                                ) : (
                                    <button 
                                        type="button"
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

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                confirmText={confirmDialog.confirmText}
                cancelText={confirmDialog.cancelText}
                danger={confirmDialog.danger}
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog({ isOpen: false })}
            />
        </div>
    );
};

export default Profile;
