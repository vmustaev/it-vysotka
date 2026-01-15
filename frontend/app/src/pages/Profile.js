import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Context } from "../index";
import TeamService from '../services/TeamService';
import UserService from '../services/UserService';
import ConfirmDialog from '../components/ConfirmDialog';
import '../styles/profile.css';

const Profile = () => {
    const { store } = useContext(Context);
    const [searchParams, setSearchParams] = useSearchParams();
    const [profile, setProfile] = useState(null);
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ type: null, message: '' });
    const [teamName, setTeamName] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
    });

    useEffect(() => {
        document.body.style.overflowY = 'scroll';
        return () => {
            document.body.style.overflowY = '';
        };
    }, []);

    // Обработка URL параметров
    useEffect(() => {
        const joined = searchParams.get('joined');
        const joinError = searchParams.get('join_error');

        if (joined === 'true') {
            setNotification({ type: 'success', message: 'Вы успешно присоединились к команде!' });
            setSearchParams({}, { replace: true });
        }

        if (joinError) {
            setNotification({ type: 'error', message: decodeURIComponent(joinError) });
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    // Загрузка профиля
    useEffect(() => {
        if (store.isAuth) {
            loadProfile();
        }
    }, [store.isAuth]);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const profileResponse = await UserService.getProfile();
            setProfile(profileResponse.data.data);

            if (profileResponse.data.data.teamId) {
                const teamResponse = await TeamService.getMyTeam();
                setTeam(teamResponse.data.data);
            } else {
                setTeam(null);
            }
        } catch (e) {
            console.error('Ошибка загрузки профиля:', e);
        } finally {
            setLoading(false);
        }
    };

    // Единая функция для выполнения операций с автоматической обработкой уведомлений
    const executeAction = async (action, options = {}) => {
        const {
            showLoading = true,
            reloadProfile = false,
            reloadTeam = false,
            reloadOnError = false,
            onSuccess = null,
            clearForm = false
        } = options;

        setNotification({ type: null, message: '' });
        
        if (showLoading) {
            setActionLoading(true);
        }

        try {
            const response = await action();
            
            // Автоматически показываем сообщение от API
            if (response?.data?.message) {
                setNotification({ type: 'success', message: response.data.message });
            }

            // Очистка формы если нужно
            if (clearForm) {
                setTeamName('');
                setShowCreateForm(false);
            }

            // Перезагрузка данных
            if (reloadProfile) {
                await loadProfile();
            } else if (reloadTeam) {
                const teamResponse = await TeamService.getMyTeam();
                setTeam(teamResponse.data.data);
            }

            // Callback после успеха
            if (onSuccess) {
                onSuccess(response);
            }

        } catch (error) {
            // Автоматическая обработка ошибок
            const errorData = error.response?.data;
            const errorMessage = errorData?.message || '';
            
            if (errorData?.errors) {
                const errors = errorData.errors;
                if (errors.name) {
                    setNotification({ type: 'error', message: errors.name[0] });
                } else if (Array.isArray(errors)) {
                    setNotification({ type: 'error', message: errors[0] });
                } else {
                    setNotification({ type: 'error', message: errorData.message || 'Произошла ошибка' });
                }
            } else {
                setNotification({ type: 'error', message: errorMessage || 'Произошла ошибка' });
            }

            // Перезагрузка при ошибке - всегда полный профиль для синхронизации
            if (reloadOnError) {
                try {
                    await loadProfile();
                } catch (e) {
                    console.error('Ошибка при перезагрузке профиля:', e);
                }
            }
        } finally {
            if (showLoading) {
                setActionLoading(false);
            }
        }
    };

    // Обработчики операций - теперь просто вызывают executeAction
    const handleCreateTeam = (e) => {
        e.preventDefault();

        if (!teamName.trim()) {
            setNotification({ type: 'error', message: 'Введите название команды' });
            return;
        }

        executeAction(
            () => TeamService.createTeam(teamName),
            { 
                reloadProfile: true, 
                clearForm: true,
                reloadOnError: true // Обновляем профиль даже при ошибке (если уже в команде)
            }
        );
    };

    const handleLeaveTeam = () => {
        setConfirmDialog({
            isOpen: true,
            title: 'Покинуть команду',
            message: 'Вы уверены, что хотите покинуть команду?',
            confirmText: 'Покинуть',
            cancelText: 'Отмена',
            danger: true,
            onConfirm: () => {
                setConfirmDialog({ isOpen: false });
                executeAction(
                    () => TeamService.leaveTeam(),
                    { 
                        reloadProfile: true,
                        reloadOnError: true // Обновляем даже при ошибке
                    }
                );
            }
        });
    };

    const handleKickMember = (userId, memberName) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Исключить участника',
            message: `Вы уверены, что хотите исключить ${memberName}?`,
            confirmText: 'Исключить',
            cancelText: 'Отмена',
            danger: true,
            onConfirm: () => {
                setConfirmDialog({ isOpen: false });
                executeAction(
                    () => TeamService.kickMember(userId),
                    { 
                        reloadTeam: true,
                        reloadOnError: true // Обновляем даже при ошибке
                    }
                );
            }
        });
    };

    const handleDeleteTeam = () => {
        setConfirmDialog({
            isOpen: true,
            title: 'Удалить команду',
            message: 'Вы уверены, что хотите удалить команду? Это действие необратимо!',
            confirmText: 'Удалить',
            cancelText: 'Отмена',
            danger: true,
            onConfirm: () => {
                setConfirmDialog({ isOpen: false });
                executeAction(
                    () => TeamService.deleteTeam(),
                    { 
                        reloadProfile: true,
                        reloadOnError: true // Обновляем даже при ошибке
                    }
                );
            }
        });
    };

    const copyInviteLink = () => {
        navigator.clipboard.writeText(team.inviteLink);
        setNotification({ type: 'success', message: 'Ссылка скопирована в буфер обмена!' });
        setTimeout(() => setNotification({ type: null, message: '' }), 3000);
    };

    if (loading) {
        return (
            <div className="page profile-page">
                <div className="page-content">
                    <div className="loading">Загрузка профиля...</div>
                </div>
            </div>
        );
    }

    if (!store.isAuth) {
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

    if (!profile) {
        return (
            <div className="page">
                <div className="page-content">
                    <div className="loading">Загрузка профиля...</div>
                </div>
            </div>
        );
    }

    const isLead = profile.isLead;

    return (
        <div className="page profile-page">
            <div className="page-content">
                <div className="page-header">
                    <h1 className="page-title">Профиль</h1>
                    <p className="page-subtitle">Управление профилем и командой</p>
                </div>

                {/* User Info Section */}
                <div className="section">
                    <h2 className="section-title">Личная информация</h2>
                    <div className="profile-info-card">
                        <div className="profile-row">
                            <span className="profile-label">ФИО:</span>
                            <span className="profile-value">
                                {profile.last_name} {profile.first_name} {profile.second_name}
                            </span>
                        </div>
                        <div className="profile-row">
                            <span className="profile-label">Email:</span>
                            <span className="profile-value">{profile.email}</span>
                        </div>
                    </div>
                </div>

                {/* Team Section */}
                <div className="section">
                    <div className="section-header">
                        <h2 className="section-title">Моя команда</h2>
                    </div>

                    {/* Уведомления показываем только в блоке команды */}
                    {notification.type && (
                        <div className={`alert alert-${notification.type}`}>
                            {notification.message}
                        </div>
                    )}

                    {!team ? (
                        <div className="team-empty">
                            <p className="empty-message">Вы не состоите в команде</p>

                            {!showCreateForm ? (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setShowCreateForm(true)}
                                    disabled={actionLoading}
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
                                                placeholder="Введите название"
                                                maxLength={50}
                                                disabled={actionLoading}
                                                autoFocus
                                            />
                                            <small className="form-hint">
                                                От 3 до 50 символов. Русские/английские буквы и цифры
                                            </small>
                                        </div>
                                        <div className="form-actions">
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={actionLoading}
                                            >
                                                {actionLoading ? 'Создание...' : 'Создать'}
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={() => {
                                                    setShowCreateForm(false);
                                                    setTeamName('');
                                                    setNotification({ type: null, message: '' });
                                                }}
                                                disabled={actionLoading}
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
                                <span className="team-status-badge">
                                    {team.memberCount}/3 участников
                                </span>
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
                                            disabled={actionLoading}
                                        >
                                            Копировать
                                        </button>
                                    </div>
                                    <small className="form-hint">
                                        Поделитесь ссылкой для добавления участников
                                    </small>
                                </div>
                            )}

                            <div className="team-members">
                                <h4>Участники команды</h4>
                                <div className="members-list">
                                    {team.members && team.members.map((member) => {
                                        const isCurrentUser = member.id === profile.id;
                                        const memberIsLead = member.isLead;
                                        
                                        return (
                                            <div 
                                                key={member.id} 
                                                className={`member-card ${isCurrentUser ? 'member-card-current' : ''} ${memberIsLead ? 'member-card-lead' : ''}`}
                                            >
                                                <div className="member-info">
                                                    <div className="member-name">
                                                        {member.last_name} {member.first_name} {member.second_name}
                                                        {memberIsLead && (
                                                            <span className="lead-badge">Лидер</span>
                                                        )}
                                                        {isCurrentUser && (
                                                            <span className="current-user-badge">Вы</span>
                                                        )}
                                                    </div>
                                                    <div className="member-email">{member.email}</div>
                                                </div>
                                                {isLead && !memberIsLead && (
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() =>
                                                            handleKickMember(
                                                                member.id,
                                                                `${member.first_name} ${member.last_name}`
                                                            )
                                                        }
                                                        disabled={actionLoading}
                                                    >
                                                        Исключить
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="team-actions">
                                {isLead ? (
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={handleDeleteTeam}
                                        disabled={actionLoading}
                                    >
                                        {actionLoading ? 'Удаление...' : 'Удалить команду'}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={handleLeaveTeam}
                                        disabled={actionLoading}
                                    >
                                        {actionLoading ? 'Выход...' : 'Покинуть команду'}
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
