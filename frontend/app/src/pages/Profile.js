import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Context } from "../index";
import TeamService from '../services/TeamService';
import UserService from '../services/UserService';
import CertificateService from '../services/CertificateService';
import SettingsService from '../services/SettingsService';
import FileService from '../services/FileService';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';
import EditProfileModal from '../components/EditProfileModal';
import InfoModal from '../components/InfoModal';
import DiplomasMessage from '../components/DiplomasMessage';
import '../styles/profile.css';

const getLatestDiplomasText = (diplomasByYear) => {
    const years = Object.keys(diplomasByYear)
        .map((year) => parseInt(year, 10))
        .filter((year) => !Number.isNaN(year) && diplomasByYear[String(year)]);

    if (years.length === 0) return null;

    const latestYear = Math.max(...years);
    return diplomasByYear[String(latestYear)];
};

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
    const [essayUrl, setEssayUrl] = useState('');
    const [isEditingEssay, setIsEditingEssay] = useState(false);
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);
    const [essayCloseDate, setEssayCloseDate] = useState(null);
    const [diplomasByYear, setDiplomasByYear] = useState({});
    const [essayRequirementsDoc, setEssayRequirementsDoc] = useState(null);
    const [infoModal, setInfoModal] = useState({
        isOpen: false,
        title: '',
        content: ''
    });
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
    });
    const [isEditingProfile, setIsEditingProfile] = useState(false);

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
            setNotification({ type: 'success', message: 'Вы успешно присоединились к команде!' });
            setSearchParams({}, { replace: true });
        }

        if (joinError) {
            setNotification({ type: 'error', message: decodeURIComponent(joinError) });
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    useEffect(() => {
        if (store.isAuth) {
            loadProfile();
            loadSettings();
        }
    }, [store.isAuth]);

    useEffect(() => {
        const loadEssayDoc = async () => {
            try {
                const response = await FileService.getFilesByType('regulations');
                const doc = response.files?.find(f => f.subType === 'essay_requirements') || null;
                setEssayRequirementsDoc(doc);
            } catch (e) {
                console.error('Ошибка загрузки документа требований к эссе:', e);
            }
        };
        loadEssayDoc();
    }, []);

    const loadSettings = async () => {
        try {
            const response = await SettingsService.getRegistrationStatus();
            const data = response.data.data;
            if (data.essay_close_date) {
                setEssayCloseDate(data.essay_close_date);
            }
            if (data.diplomas_by_year) {
                setDiplomasByYear(data.diplomas_by_year);
            }
        } catch (e) {
            console.error('Ошибка загрузки настроек:', e);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };


    useEffect(() => {
        if (profile && profile.essayUrl) {
            setEssayUrl(profile.essayUrl);
        }
    }, [profile]);

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
            
            if (response?.data?.message) {
                setNotification({ type: 'success', message: response.data.message });
            }

            if (clearForm) {
                setTeamName('');
                setShowCreateForm(false);
            }

            if (reloadProfile) {
                await loadProfile();
            } else if (reloadTeam) {
                const teamResponse = await TeamService.getMyTeam();
                setTeam(teamResponse.data.data);
            }

            if (onSuccess) {
                onSuccess(response);
            }

        } catch (error) {
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

    const handleCreateTeam = (e) => {
        e.preventDefault();

        const trimmedName = teamName.trim();

        if (!trimmedName) {
            setNotification({ type: 'error', message: 'Введите название команды' });
            return;
        }

        if (trimmedName.length < 3 || trimmedName.length > 50) {
            setNotification({ type: 'error', message: 'Название команды должно быть от 3 до 50 символов' });
            return;
        }

        const nameRegex = /^[a-zA-Zа-яА-ЯёЁ0-9\s]+$/;
        if (!nameRegex.test(trimmedName)) {
            setNotification({ type: 'error', message: 'Название команды может содержать только буквы (русские/английские) и цифры' });
            return;
        }

        executeAction(
            () => TeamService.createTeam(trimmedName),
            { 
                reloadProfile: true, 
                clearForm: true,
                reloadOnError: true
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
                        reloadOnError: true
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
                        reloadOnError: true
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
                        reloadOnError: true
                    }
                );
            }
        });
    };

    const handleParticipationFormatChange = (newFormat) => {
        if (newFormat === 'individual' && profile.teamId) {
            const currentUserInTeam = team?.members?.find(m => m.id === profile.id);
            const isLead = currentUserInTeam?.isLead || false;
            
            const message = isLead
                ? 'Вы являетесь лидером команды. При смене формата на индивидуальное участие команда будет удалена, а все участники выйдут из неё. Продолжить?'
                : 'Вы состоите в команде. При смене формата на индивидуальное участие вы автоматически покинете команду. Продолжить?';

            setConfirmDialog({
                isOpen: true,
                title: 'Изменить формат участия',
                message: message,
                confirmText: 'Да, изменить',
                cancelText: 'Отмена',
                danger: true,
                onConfirm: () => {
                    setConfirmDialog({ isOpen: false });
                    updateParticipationFormat(newFormat);
                }
            });
        } else {
            updateParticipationFormat(newFormat);
        }
    };

    const updateParticipationFormat = (newFormat) => {
        executeAction(
            () => UserService.updateParticipationFormat(newFormat),
            { 
                reloadProfile: true,
                reloadOnError: true
            }
        );
    };

    const copyInviteLink = () => {
        navigator.clipboard.writeText(team.inviteLink);
        setNotification({ type: 'success', message: 'Ссылка скопирована в буфер обмена!' });
    };

    const handleSaveEssay = () => {
        const trimmedUrl = essayUrl.trim();
        
        if (!trimmedUrl) {
            executeAction(
                () => UserService.updateEssayUrl(''),
                { 
                    reloadProfile: true,
                    onSuccess: () => {
                        setIsEditingEssay(false);
                        setEssayUrl('');
                    }
                }
            );
            return;
        }

        try {
            new URL(trimmedUrl);
        } catch (e) {
            setNotification({ type: 'error', message: 'Введите корректную ссылку' });
            return;
        }

        executeAction(
            () => UserService.updateEssayUrl(trimmedUrl),
            { 
                reloadProfile: true,
                onSuccess: () => {
                    setIsEditingEssay(false);
                }
            }
        );
    };

    const handleCancelEssay = () => {
        setEssayUrl(profile.essayUrl || '');
        setIsEditingEssay(false);
        setNotification({ type: null, message: '' });
    };

    const handleDownloadCertificate = async () => {
        executeAction(
            async () => {
                const response = await CertificateService.downloadCertificate(profile.id);
                
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                
                const filename = `certificate_${profile.last_name}_${profile.first_name}.pdf`;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
                
                return { data: { message: 'Сертификат скачан!' } };
            },
            { showLoading: true }
        );
    };

    if (loading) {
        return (
            <div className="page profile-page">
                <div className="page-content">
                    <div className="profile-loading">
                        <div className="loading-spinner"></div>
                        <p className="loading-text">Загрузка профиля...</p>
                    </div>
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
            <div className="page profile-page">
                <div className="page-content">
                    <div className="profile-loading">
                        <div className="loading-spinner"></div>
                        <p className="loading-text">Загрузка профиля...</p>
                    </div>
                </div>
            </div>
        );
    }

    const isLead = team?.members?.find(m => m.id === profile.id)?.isLead || false;
    const latestDiplomasText = getLatestDiplomasText(diplomasByYear);

    return (
        <div className="profile-page">
            <div className="profile-content">
                <div className="profile-hero">
                    <h1 className="profile-title">Личный кабинет</h1>
                    {profile.role === 'admin' && (
                        <p className="profile-subtitle">Управление вашим профилем администратора</p>
                    )}
                    {profile.role !== 'admin' && (
                        <p className="profile-subtitle">Управление вашим профилем участника</p>
                    )}
                </div>

                <div className="profile-sections-grid">
                <div className="profile-section">
                    <h2 className="profile-section-title">Личная информация</h2>
                    <div className="profile-card">
                        <div className="profile-main-info">
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
                                    {profile.phone && (
                                        <div className="profile-row">
                                            <span className="profile-label">Телефон:</span>
                                            <span className="profile-value">{profile.phone}</span>
                                        </div>
                                    )}
                                    <div className="profile-row">
                                        <span className="profile-label">Формат участия:</span>
                                        <div className="profile-value">
                                            <div className="profile-radio-group">
                                                <label className="profile-radio">
                                                    <input
                                                        type="radio"
                                                        name="participation_format"
                                                        value="individual"
                                                        checked={profile.participation_format === 'individual'}
                                                        onChange={(e) => handleParticipationFormatChange(e.target.value)}
                                                        disabled={actionLoading}
                                                    />
                                                    <span className="profile-radio-mark"></span>
                                                    <span className="profile-radio-text">Индивидуальное</span>
                                                </label>
                                                <label className="profile-radio">
                                                    <input
                                                        type="radio"
                                                        name="participation_format"
                                                        value="team"
                                                        checked={profile.participation_format === 'team'}
                                                        onChange={(e) => handleParticipationFormatChange(e.target.value)}
                                                        disabled={actionLoading}
                                                    />
                                                    <span className="profile-radio-mark"></span>
                                                    <span className="profile-radio-text">Командное</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="profile-additional-info">
                                    <button 
                                        className="profile-accordion-toggle"
                                        onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                                        type="button"
                                    >
                                        <span>Дополнительная информация</span>
                                        <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className={isAccordionOpen ? 'accordion-icon-open' : 'accordion-icon-closed'}
                                        >
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </button>

                                    <div className={`profile-accordion-content ${isAccordionOpen ? 'accordion-open' : ''}`}>
                                        {profile.school && (
                                            <div className="profile-row">
                                                <span className="profile-label">Школа:</span>
                                                <span className="profile-value">{profile.school}</span>
                                            </div>
                                        )}
                                        {profile.grade && (
                                            <div className="profile-row">
                                                <span className="profile-label">Класс:</span>
                                                <span className="profile-value">{profile.grade} класс</span>
                                            </div>
                                        )}
                                        {profile.city && (
                                            <div className="profile-row">
                                                <span className="profile-label">Город:</span>
                                                <span className="profile-value">{profile.city}</span>
                                            </div>
                                        )}
                                        {profile.region && (
                                            <div className="profile-row">
                                                <span className="profile-label">Регион:</span>
                                                <span className="profile-value">{profile.region}</span>
                                            </div>
                                        )}
                                        {profile.programming_language && (
                                            <div className="profile-row">
                                                <span className="profile-label">Язык программирования:</span>
                                                <span className="profile-value">{profile.programming_language}</span>
                                            </div>
                                        )}
                                        {profile.birthday && (
                                            <div className="profile-row">
                                                <span className="profile-label">Дата рождения:</span>
                                                <span className="profile-value">
                                                    {new Date(profile.birthday).toLocaleDateString('ru-RU', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                        {profile.role === 'admin' && (
                                            <div className="profile-row">
                                                <span className="profile-label">Роль:</span>
                                                <span className="profile-value">
                                                    <span className="admin-badge">Администратор</span>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                                    <button
                                        className="btn btn-secondary btn-with-icon"
                                        onClick={() => setIsEditingProfile(true)}
                                        disabled={actionLoading}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                        </svg>
                                        Редактировать личные данные
                                    </button>
                                </div>
                    </div>
                </div>

                {profile.participation_format === 'team' && (
                    <div className="profile-section">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <h2 className="profile-section-title" style={{ marginBottom: 0 }}>Моя команда</h2>
                            <button 
                                className="info-button"
                                onClick={() => setInfoModal({
                                    isOpen: true,
                                    title: 'Как создать или присоединиться к команде',
                                    content: (
                                        <div>
                                            <h4 style={{ marginTop: 0, color: '#1e3a8a' }}>Создать команду:</h4>
                                            <p><strong>Шаг 1:</strong> Нажмите кнопку "Создать команду"</p>
                                            <p><strong>Шаг 2:</strong> Придумайте название команды (от 3 до 50 символов)</p>
                                            <p><strong>Шаг 3:</strong> После создания вы станете капитаном команды</p>
                                            <p><strong>Шаг 4:</strong> Скопируйте ссылку-приглашение и отправьте её участникам</p>
                                            
                                            <h4 style={{ marginTop: '20px', color: '#1e3a8a' }}>Присоединиться к команде:</h4>
                                            <p><strong>Шаг 1:</strong> Получите ссылку-приглашение от капитана команды</p>
                                            <p><strong>Шаг 2:</strong> Перейдите по ссылке</p>
                                            <p><strong>Шаг 3:</strong> Подтвердите вступление в команду</p>
                                            
                                            <p style={{ marginTop: '16px', padding: '12px', background: '#eff6ff', borderRadius: '8px', fontSize: '14px' }}>
                                                <strong>Важно:</strong> В команде может быть от 2 до 3 участников. Капитан команды может удалять участников и удалить команду.
                                            </p>
                                        </div>
                                    )
                                })}
                                title="Как работать с командой"
                            >
                                ?
                            </button>
                        </div>
                        
                        <div className="profile-card">
                        {!team ? (
                            <div className="team-empty">
                            <p className="empty-message">Вы не состоите в команде</p>

                            {!showCreateForm ? (
                                <button
                                    className="btn btn-primary btn-with-icon"
                                    onClick={() => setShowCreateForm(true)}
                                    disabled={actionLoading}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                        <circle cx="9" cy="7" r="4"/>
                                        <line x1="19" y1="8" x2="19" y2="14"/>
                                        <line x1="22" y1="11" x2="16" y2="11"/>
                                    </svg>
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
                                                className="btn btn-primary btn-with-icon"
                                                disabled={actionLoading}
                                            >
                                                {actionLoading ? (
                                                    <>
                                                        <svg className="icon-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                                        </svg>
                                                        Создание...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <polyline points="20 6 9 17 4 12"/>
                                                        </svg>
                                                        Создать
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-outline btn-with-icon"
                                                onClick={() => {
                                                    setShowCreateForm(false);
                                                    setTeamName('');
                                                    setNotification({ type: null, message: '' });
                                                }}
                                                disabled={actionLoading}
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                                </svg>
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
                                            className="btn btn-secondary btn-with-icon"
                                            onClick={copyInviteLink}
                                            disabled={actionLoading}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                                            </svg>
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
                                                        className="btn btn-danger btn-sm btn-with-icon"
                                                        onClick={() =>
                                                            handleKickMember(
                                                                member.id,
                                                                `${member.first_name} ${member.last_name}`
                                                            )
                                                        }
                                                        disabled={actionLoading}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                                            <circle cx="8.5" cy="7" r="4"/>
                                                            <line x1="18" y1="8" x2="23" y2="13"/>
                                                            <line x1="23" y1="8" x2="18" y2="13"/>
                                                        </svg>
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
                                        className="btn btn-danger btn-with-icon"
                                        onClick={handleDeleteTeam}
                                        disabled={actionLoading}
                                    >
                                        {actionLoading ? (
                                            <>
                                                <svg className="icon-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                                </svg>
                                                Удаление...
                                            </>
                                        ) : (
                                            <>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="3 6 5 6 21 6"/>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                                    <line x1="10" y1="11" x2="10" y2="17"/>
                                                    <line x1="14" y1="11" x2="14" y2="17"/>
                                                </svg>
                                                Удалить команду
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="btn btn-danger btn-with-icon"
                                        onClick={handleLeaveTeam}
                                        disabled={actionLoading}
                                    >
                                        {actionLoading ? (
                                            <>
                                                <svg className="icon-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                                </svg>
                                                Выход...
                                            </>
                                        ) : (
                                            <>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                                    <polyline points="16 17 21 12 16 7"/>
                                                    <line x1="21" y1="12" x2="9" y2="12"/>
                                                </svg>
                                                Покинуть команду
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                        </div>
                    </div>
                )}

                <div className="profile-section">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <h2 className="profile-section-title" style={{ marginBottom: 0 }}>Результаты</h2>
                        <button 
                            className="info-button"
                            onClick={() => setInfoModal({
                                isOpen: true,
                                title: 'О результатах и сертификатах',
                                content: (
                                    <div>
                                        <p>После завершения чемпионата здесь появятся ваши результаты:</p>
                                        <p><strong>• Место</strong> - ваше место в общем зачете</p>
                                        <p><strong>• Сертификат</strong> - если вы заняли призовое место или участвовали в чемпионате</p>
                                        
                                        <p style={{ marginTop: '16px' }}>Результаты публикуются после подведения итогов чемпионата.</p>
                                        
                                        <p style={{ marginTop: '16px', padding: '12px', background: '#eff6ff', borderRadius: '8px', fontSize: '14px' }}>
                                            <strong>Важно:</strong> Сертификаты выдаются всем участникам. Призерам выдаются дипломы.
                                        </p>
                                    </div>
                                )
                            })}
                            title="О результатах"
                            >
                                ?
                            </button>
                    </div>
                    
                    <div className="profile-card">
                        {profile.place || profile.certificateId ? (
                            <>
                                {profile.place && (
                                    <>
                                        <div className="profile-row">
                                            <span className="profile-label">Место:</span>
                                            <span className="profile-value">
                                                <span 
                                                    className="place-badge" 
                                                    style={{
                                                        background: profile.place === 1 ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)' :
                                                                   profile.place === 2 ? 'linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%)' :
                                                                   profile.place === 3 ? 'linear-gradient(135deg, #cd7f32 0%, #e6a857 100%)' :
                                                                   'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                                        color: profile.place === 1 ? '#b8860b' :
                                                               profile.place === 2 ? '#696969' :
                                                               profile.place === 3 ? '#8b4513' :
                                                               '#ffffff',
                                                        boxShadow: profile.place === 1 ? '0 4px 20px rgba(255, 215, 0, 0.5)' :
                                                                  profile.place === 2 ? '0 4px 20px rgba(192, 192, 192, 0.5)' :
                                                                  profile.place === 3 ? '0 4px 20px rgba(205, 127, 50, 0.5)' :
                                                                  '0 4px 12px rgba(251, 191, 36, 0.3)'
                                                    }}
                                                >
                                                    🏆 {profile.place} место
                                                </span>
                                            </span>
                                        </div>
                                        {latestDiplomasText && (
                                        <div style={{
                                            backgroundColor: '#eff6ff',
                                            borderLeft: '4px solid #3b82f6',
                                            padding: '16px',
                                            borderRadius: '8px',
                                            marginTop: '16px'
                                        }}>
                                            <p style={{
                                                margin: 0,
                                                color: '#1e40af',
                                                fontSize: '14px',
                                                lineHeight: '1.6'
                                            }}>
                                                <DiplomasMessage
                                                    text={latestDiplomasText}
                                                    linkClassName="certificate-link"
                                                />
                                            </p>
                                        </div>
                                        )}
                                    </>
                                )}
                                {profile.certificateId && (
                                    <div className="profile-row">
                                        <span className="profile-label">Сертификат:</span>
                                        <span className="profile-value">
                                            <button 
                                                onClick={handleDownloadCertificate}
                                                disabled={actionLoading}
                                                className="certificate-link"
                                                style={{ 
                                                    background: 'none', 
                                                    border: 'none', 
                                                    padding: 0,
                                                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                                                    opacity: actionLoading ? 0.6 : 1
                                                }}
                                            >
                                                {actionLoading ? (
                                                    <>
                                                        <svg className="icon-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                                        </svg>
                                                        Скачивание...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                                            <polyline points="14 2 14 8 20 8"/>
                                                            <line x1="16" y1="13" x2="8" y2="13"/>
                                                            <line x1="16" y1="17" x2="8" y2="17"/>
                                                            <polyline points="10 9 9 9 8 9"/>
                                                        </svg>
                                                        Скачать сертификат
                                                    </>
                                                )}
                                            </button>
                                        </span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="results-empty">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="results-empty-icon">
                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                                </svg>
                                <p className="results-empty-text">Результаты будут доступны после завершения чемпионата</p>
                            </div>
                        )}
                    </div>
                </div>

                {(profile.participation_format === 'individual' || (profile.participation_format === 'team' && isLead)) && (
                    <div className="profile-section">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <h2 className="profile-section-title" style={{ marginBottom: 0 }}>Эссе</h2>
                            <button 
                                className="info-button"
                                onClick={() => setInfoModal({
                                    isOpen: true,
                                    title: 'Как подготовить и загрузить эссе',
                                    content: (
                                        <div>
                                            <h4 style={{ marginTop: 0, color: '#1e3a8a' }}>Эссе состоит из ДВУХ частей:</h4>
                                            
                                            <p style={{ marginTop: '12px', marginBottom: '8px', fontWeight: 600 }}>1. Текстовая часть (до 1 страницы):</p>
                                            <p style={{ marginLeft: '16px', marginTop: '4px', marginBottom: '4px' }}>• Форматы: .docx, .txt или .pdf</p>
                                            <p style={{ marginLeft: '16px', marginTop: '4px', marginBottom: '4px' }}>• Тема: "Мой путь в индустрии ИТ"</p>
                                            
                                            <p style={{ marginTop: '12px', marginBottom: '8px', fontWeight: 600 }}>2. Видео-высказывание (до 60 секунд):</p>
                                            <p style={{ marginLeft: '16px', marginTop: '4px', marginBottom: '4px' }}>• Художественное видео по теме эссе</p>
                                            <p style={{ marginLeft: '16px', marginTop: '4px', marginBottom: '4px' }}>• Можно использовать фото, видео, изображения с ИИ</p>
                                            
                                            <h4 style={{ marginTop: '16px', color: '#1e3a8a' }}>Как загрузить:</h4>
                                            <p><strong>Шаг 1:</strong> Создайте папку на облаке (Google Drive, Яндекс.Диск и т.д.)</p>
                                            <p><strong>Шаг 2:</strong> Загрузите туда текстовый файл И видео</p>
                                            <p><strong>Шаг 3:</strong> Откройте доступ к папке "Всем, у кого есть ссылка"</p>
                                            <p><strong>Шаг 4:</strong> Скопируйте ссылку на папку и вставьте в поле ниже</p>
                                            
                                            <p style={{ marginTop: '16px', padding: '12px', background: '#fef3c7', borderRadius: '8px', fontSize: '14px', borderLeft: '4px solid #f59e0b' }}>
                                                <strong>⚠️ Важно:</strong> Обе части обязательны! Максимум за эссе – 40 баллов. Срок подачи: до 9 марта 2026 года.
                                            </p>
                                        </div>
                                    )
                                })}
                                title="Как подготовить и загрузить эссе"
                            >
                                ?
                            </button>
                        </div>
                        
                        <div className="profile-card">
                            {essayCloseDate && (
                                <div className="profile-row" style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
                                    <span className="profile-label">Срок подачи:</span>
                                    <span className="profile-value" style={{ fontWeight: 600, color: profile.essay_visible ? '#3b82f6' : '#dc2626' }}>
                                        до {formatDate(essayCloseDate)}
                                    </span>
                                </div>
                            )}
                            {!profile.essay_visible ? (
                                <div className="profile-row">
                                    <span className="profile-label">Ссылка на эссе:</span>
                                    <div className="profile-value" style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                                        {profile.essayUrl ? (
                                            <a href={profile.essayUrl} target="_blank" rel="noopener noreferrer" className="essay-link" style={{ wordBreak: 'break-all' }}>
                                                {profile.essayUrl}
                                            </a>
                                        ) : (
                                            <span className="empty-value">Не указано</span>
                                        )}
                                    </div>
                                </div>
                            ) : !isEditingEssay ? (
                                <div className="profile-row">
                                    <span className="profile-label">Ссылка на эссе:</span>
                                    <div className="profile-value" style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between', width: '100%' }}>
                                        <span style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
                                            {profile.essayUrl ? (
                                                <a 
                                                    href={profile.essayUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="essay-link"
                                                    style={{ wordBreak: 'break-all' }}
                                                >
                                                    {profile.essayUrl}
                                                </a>
                                            ) : (
                                                <span className="empty-value">Не указано</span>
                                            )}
                                        </span>
                                        <button
                                            className="btn btn-secondary btn-sm btn-with-icon"
                                            onClick={() => setIsEditingEssay(true)}
                                            disabled={actionLoading}
                                            style={{ flexShrink: 0, alignSelf: 'center' }}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                            </svg>
                                            {profile.essayUrl ? 'Изменить' : 'Добавить'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="essay-edit-form">
                                    <div className="form-group">
                                        <label className="form-label">Ссылка на эссе</label>
                                        <input
                                            type="url"
                                            className="form-input"
                                            value={essayUrl}
                                            onChange={(e) => setEssayUrl(e.target.value)}
                                            placeholder="https://..."
                                            disabled={actionLoading}
                                            autoFocus
                                        />
                                        <small className="form-hint">
                                            Вставьте ссылку на ваше эссе. Убедитесь, что доступ открыт для просмотра.
                                        </small>
                                    </div>
                                    <div className="form-actions">
                                        <button
                                            type="button"
                                            className="btn btn-primary btn-with-icon"
                                            onClick={handleSaveEssay}
                                            disabled={actionLoading}
                                        >
                                            {actionLoading ? (
                                                <>
                                                    <svg className="icon-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                                    </svg>
                                                    Сохранение...
                                                </>
                                            ) : (
                                                <>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="20 6 9 17 4 12"/>
                                                    </svg>
                                                    Сохранить
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline btn-with-icon"
                                            onClick={handleCancelEssay}
                                            disabled={actionLoading}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="18" y1="6" x2="6" y2="18"/>
                                                <line x1="6" y1="6" x2="18" y2="18"/>
                                            </svg>
                                            Отмена
                                        </button>
                                    </div>
                                </div>
                            )}
                            {essayRequirementsDoc && (
                                <div style={{ marginTop: '12px' }}>
                                    <a href={essayRequirementsDoc.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm btn-with-icon" style={{ display: 'inline-flex' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                            <polyline points="14 2 14 8 20 8"/>
                                            <line x1="16" y1="13" x2="8" y2="13"/>
                                            <line x1="16" y1="17" x2="8" y2="17"/>
                                            <polyline points="10 9 9 9 8 9"/>
                                        </svg>
                                        Требования к эссе
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                </div>
            </div>

            <InfoModal
                isOpen={infoModal.isOpen}
                title={infoModal.title}
                content={infoModal.content}
                onClose={() => setInfoModal({ isOpen: false, title: '', content: '' })}
            />

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

            {notification.type && (
                <Toast
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification({ type: null, message: '' })}
                    duration={5000}
                />
            )}

            <EditProfileModal
                isOpen={isEditingProfile}
                onClose={() => setIsEditingProfile(false)}
                profile={profile}
                onSave={() => {
                    setNotification({ type: 'success', message: 'Профиль успешно обновлен' });
                    loadProfile();
                }}
            />
        </div>
    );
};

export default Profile;
