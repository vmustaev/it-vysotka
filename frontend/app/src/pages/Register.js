import React, { useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from "../index";
import { observer } from "mobx-react-lite";
import SearchableSelect from '../components/SearchableSelect';
import SettingsService from '../services/SettingsService';
import Toast from '../components/Toast';
import InfoModal from '../components/InfoModal';
import $api from '../http';
import '../styles/register-closed.css';
import '../styles/register.css';

const RegisterPage = observer(() => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        password_confirmation: '',
        last_name: '',
        first_name: '',
        second_name: '',
        birthday: '',
        region: '',
        city: '',
        school: '',
        programming_language: '',
        phone: '',
        grade: '',
        participation_format: ''
    });

    const [consent, setConsent] = useState(false);

    const [errors, setErrors] = useState({});
    const [notification, setNotification] = useState({ type: null, message: '' });
    const [infoModal, setInfoModal] = useState({ isOpen: false, message: '' });
    const [isLoading, setIsLoading] = useState(false);
    const { store } = useContext(Context);
    const navigate = useNavigate();

    const [regions, setRegions] = useState([]);
    const [cities, setCities] = useState([]);
    const [schools, setSchools] = useState([]);
    const [isLoadingRegions, setIsLoadingRegions] = useState(false);
    const [isLoadingCities, setIsLoadingCities] = useState(false);
    const [isLoadingSchools, setIsLoadingSchools] = useState(false);
    const [registrationStatus, setRegistrationStatus] = useState({ isOpen: null, status: null });
    const [essayCloseDate, setEssayCloseDate] = useState(null);

    useEffect(() => {
        checkRegistrationStatus();
    }, []);

    useEffect(() => {
        if (registrationStatus.isOpen === true) {
            loadRegions();
        }
    }, [registrationStatus.isOpen]);

    const checkRegistrationStatus = async () => {
        try {
            const response = await SettingsService.getRegistrationStatus();
            setRegistrationStatus({
                isOpen: response.data.data.isOpen,
                status: response.data.data.status,
                message: response.data.data.message,
                registration_start: response.data.data.registration_start,
                registration_end: response.data.data.registration_end,
                championship_datetime: response.data.data.championship_datetime
            });
            if (response.data.data.essay_close_date) {
                setEssayCloseDate(response.data.data.essay_close_date);
            }
        } catch (e) {
            console.error('Error checking registration status:', e);
            setRegistrationStatus({ isOpen: true, status: 'open' });
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

    const calculateAge = (birthday) => {
        if (!birthday) return null;
        const today = new Date();
        const birthDate = new Date(birthday);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const isMinor = () => {
        const age = calculateAge(formData.birthday);
        return age !== null && age < 18;
    };

    const isAdult = () => {
        const age = calculateAge(formData.birthday);
        return age !== null && age >= 18;
    };

    useEffect(() => {
        if (formData.region) {
            loadCities(formData.region);
            setFormData(prev => ({
                ...prev,
                city: '',
                school: ''
            }));
            setCities([]);
            setSchools([]);
        } else {
            setCities([]);
            setSchools([]);
        }
    }, [formData.region]);

    useEffect(() => {
        if (formData.region && formData.city) {
            loadSchools(formData.region, formData.city);
            setFormData(prev => ({
                ...prev,
                school: ''
            }));
            setSchools([]);
        } else {
            setSchools([]);
        }
    }, [formData.region, formData.city]);

    const loadRegions = async () => {
        try {
            setIsLoadingRegions(true);
            const response = await $api.get('/schools/regions');
            setRegions(response.data.data || []);
        } catch (error) {
            console.error('Error loading regions:', error);
        } finally {
            setIsLoadingRegions(false);
        }
    };

    const loadCities = async (region) => {
        if (!region) return;
        try {
            setIsLoadingCities(true);
            const response = await $api.get('/schools/cities', {
                params: { region }
            });
            setCities(response.data.data || []);
        } catch (error) {
            console.error('Error loading cities:', error);
        } finally {
            setIsLoadingCities(false);
        }
    };

    const loadSchools = async (region, city) => {
        if (!region || !city) return;
        try {
            setIsLoadingSchools(true);
            const response = await $api.get('/schools', {
                params: { region, city }
            });
            setSchools(response.data.data || []);
        } catch (error) {
            console.error('Error loading schools:', error);
        } finally {
            setIsLoadingSchools(false);
        }
    };



    const formatPhoneNumber = (value) => {
        const cleaned = value.replace(/\D/g, '');
        
        if (!cleaned) {
            return '';
        }
        
        let digits = cleaned.startsWith('8') ? '7' + cleaned.slice(1) : cleaned;
        
        if (!digits.startsWith('7')) {
            digits = '7' + digits;
        }
        
        digits = digits.slice(0, 11);
        
        if (digits.length === 1) {
            return `+${digits}`;
        } else if (digits.length <= 4) {
            return `+${digits.slice(0, 1)} (${digits.slice(1)}`;
        } else if (digits.length <= 7) {
            return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4)}`;
        } else if (digits.length <= 9) {
            return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
        } else {
            return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
        }
    };

    const handlePhoneChange = (e) => {
        const { value } = e.target;
        const formatted = formatPhoneNumber(value);
        
        setFormData(prev => ({
            ...prev,
            phone: formatted
        }));
        
        if (errors.phone) {
            setErrors(prev => ({
                ...prev,
                phone: []
            }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: []
            }));
        }
        if (name === 'birthday') {
            setConsent(false);
            if (errors.consent) {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.consent;
                    return newErrors;
                });
            }
        }
    };

    const handleParticipationFormatChange = (e) => {
        const value = e.target.value;
        
        setFormData(prev => ({
            ...prev,
            participation_format: value
        }));
        
        if (errors.participation_format) {
            setErrors(prev => ({
                ...prev,
                participation_format: []
            }));
        }
        
        let message = '';
        const dateText = essayCloseDate ? ` до ${formatDate(essayCloseDate)}` : '';
        
        if (value === 'individual') {
            message = `Вы выбрали индивидуальное участие. После активации аккаунта в личном кабинете вам необходимо указать ссылку на эссе${dateText}.`;
        } else if (value === 'team') {
            message = `Вы выбрали командное участие. После активации аккаунта в личном кабинете вам необходимо создать команду или присоединиться к команде по ссылке. Лидеру команды необходимо прикрепить эссе${dateText}.`;
        }
        
        setInfoModal({
            isOpen: true,
            message: message
        });
    };

    const handleRegionChange = (value) => {
        setFormData(prev => ({
            ...prev,
            region: value,
            city: '',
            school: ''
        }));
        setCities([]);
        setSchools([]);
        if (errors.region) {
            setErrors(prev => ({
                ...prev,
                region: []
            }));
        }
    };

    const handleCityChange = (value) => {
        setFormData(prev => ({
            ...prev,
            city: value,
            school: ''
        }));
        setSchools([]);
        if (errors.city) {
            setErrors(prev => ({
                ...prev,
                city: []
            }));
        }
    };

    const handleSchoolChange = (value) => {
        setFormData(prev => ({
            ...prev,
            school: value
        }));
        if (errors.school) {
            setErrors(prev => ({
                ...prev,
                school: []
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isLoading) return;
        
        setIsLoading(true);
        setErrors({});
        
        try {
            const cleanedPhone = formData.phone.replace(/\D/g, '');
            let phoneToSend = cleanedPhone;
            
            if (phoneToSend.startsWith('8')) {
                phoneToSend = '7' + phoneToSend.slice(1);
            }
            else if (phoneToSend && !phoneToSend.startsWith('7')) {
                phoneToSend = '7' + phoneToSend;
            }
            
            const age = calculateAge(formData.birthday);
            if (age !== null && !consent) {
                const errorMessage = age < 18 
                    ? 'Необходимо согласие родителя' 
                    : 'Необходимо ваше согласие';
                setErrors({ consent: [errorMessage] });
                setIsLoading(false);
                return;
            }

            const dataToSend = {
                ...formData,
                phone: phoneToSend ? `+${phoneToSend}` : '',
                consent: consent
            };
            
            await store.registration(dataToSend);
            
            navigate('/login', { 
                state: { 
                    registrationSuccess: true,
                    message: 'Регистрация успешна! Пожалуйста, проверьте вашу почту для активации аккаунта.'
                } 
            });
        } catch (e) {
            const responseData = e.response?.data;
            const newErrors = {};
            
            if (responseData?.fieldErrors && Object.keys(responseData.fieldErrors).length > 0) {
                Object.assign(newErrors, responseData.fieldErrors);
                setErrors(newErrors);
            } else {
                const errorMessage = responseData?.message || 'Ошибка регистрации';
                setNotification({ type: 'error', message: errorMessage });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getFieldError = (fieldName) => {
        return errors[fieldName] ? errors[fieldName][0] : '';
    };

    const isFieldInvalid = (fieldName) => {
        return errors[fieldName] && errors[fieldName].length > 0;
    };

    if (registrationStatus.isOpen === null) {
        return null;
    }

    if (!registrationStatus.isOpen) {
        const getStatusContent = () => {
            const status = registrationStatus.status;
            
            if (status === 'not_started') {
                return {
                    icon: '⏰',
                    title: 'Регистрация еще не началась',
                    text: 'Следите за новостями о начале регистрации!',
                    iconClass: 'status-icon-not-started'
                };
            } else if (status === 'not_opened_yet') {
                return {
                    icon: '📅',
                    title: 'Регистрация еще не открыта',
                    text: registrationStatus.registration_start
                        ? `Регистрация откроется ${formatDate(registrationStatus.registration_start)}. Следите за новостями!`
                        : 'Следите за новостями о начале регистрации!',
                    iconClass: 'status-icon-not-opened'
                };
            } else {
                // closed
                return {
                    icon: '✓',
                    title: 'Регистрация закрыта',
                    text: 'Регистрация на текущий год закрыта. Следите за новостями о следующих мероприятиях!',
                    iconClass: 'status-icon-closed'
                };
            }
        };

        const statusContent = getStatusContent();

        return (
            <div className="registration-closed-page">
                <div className="registration-closed-content">
                    <div className="registration-closed-card">
                        <div className={`closed-icon ${statusContent.iconClass}`}>
                            {statusContent.icon}
                        </div>
                        <h1 className="closed-title">
                            {statusContent.title}
                        </h1>
                        <p className="closed-text">
                            {statusContent.text}
                        </p>
                        <div className="closed-actions">
                            <button 
                                className="btn-closed btn-closed-primary"
                                onClick={() => navigate('/')}
                            >
                                На главную
                            </button>
                            <button 
                                className="btn-closed btn-closed-secondary"
                                onClick={() => navigate('/login')}
                            >
                                Войти в аккаунт
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="register-page">
            {notification.message && (
                <Toast
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification({ type: null, message: '' })}
                />
            )}

            <InfoModal
                isOpen={infoModal.isOpen}
                message={infoModal.message}
                onClose={() => setInfoModal({ isOpen: false, message: '' })}
            />
            
            <div className="register-content">
                <div className="register-hero">
                    <h1 className="register-title">Регистрация на чемпионат</h1>
                </div>

                <div className="register-form-card">
                    <form onSubmit={handleSubmit} className="register-form">
                        <div className="register-form-section">
                            <h3 className="register-section-title">Учетные данные</h3>
                            <div className="register-form-group">
                                <label className="register-label">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`register-input ${isFieldInvalid('email') ? 'error' : ''}`}
                                />
                                {isFieldInvalid('email') && (
                                    <div className="register-error">
                                        {getFieldError('email')}
                                    </div>
                                )}
                            </div>

                            <div className="register-form-row">
                                <div className="register-form-group">
                                    <label className="register-label">Пароль</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`register-input ${isFieldInvalid('password') ? 'error' : ''}`}
                                    />
                                    {isFieldInvalid('password') && (
                                        <div className="register-error">
                                            {getFieldError('password')}
                                        </div>
                                    )}
                                </div>

                                <div className="register-form-group">
                                    <label className="register-label">Подтверждение пароля</label>
                                    <input
                                        type="password"
                                        name="password_confirmation"
                                        value={formData.password_confirmation}
                                        onChange={handleChange}
                                        className={`register-input ${isFieldInvalid('password_confirmation') ? 'error' : ''}`}
                                    />
                                    {isFieldInvalid('password_confirmation') && (
                                        <div className="register-error">
                                            {getFieldError('password_confirmation')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="register-form-section">
                            <h3 className="register-section-title">Личные данные</h3>

                            <div className="register-form-row register-form-row-3">
                                <div className="register-form-group">
                                    <label className="register-label">Фамилия</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        className={`register-input ${isFieldInvalid('last_name') ? 'error' : ''}`}
                                    />
                                    {isFieldInvalid('last_name') && (
                                        <div className="register-error">
                                            {getFieldError('last_name')}
                                        </div>
                                    )}
                                </div>

                                <div className="register-form-group">
                                    <label className="register-label">Имя</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        className={`register-input ${isFieldInvalid('first_name') ? 'error' : ''}`}
                                    />
                                    {isFieldInvalid('first_name') && (
                                        <div className="register-error">
                                            {getFieldError('first_name')}
                                        </div>
                                    )}
                                </div>

                                <div className="register-form-group">
                                    <label className="register-label">Отчество</label>
                                    <input
                                        type="text"
                                        name="second_name"
                                        value={formData.second_name}
                                        onChange={handleChange}
                                        className={`register-input ${isFieldInvalid('second_name') ? 'error' : ''}`}
                                    />
                                    {isFieldInvalid('second_name') && (
                                        <div className="register-error">
                                            {getFieldError('second_name')}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="register-form-row">
                                <div className="register-form-group">
                                    <label className="register-label">Дата рождения</label>
                                    <input
                                        type="date"
                                        name="birthday"
                                        value={formData.birthday}
                                        onChange={handleChange}
                                        className={`register-input ${isFieldInvalid('birthday') ? 'error' : ''}`}
                                    />
                                    {isFieldInvalid('birthday') && (
                                        <div className="register-error">
                                            {getFieldError('birthday')}
                                        </div>
                                    )}
                                </div>

                                <div className="register-form-group">
                                    <label className="register-label">Телефон</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handlePhoneChange}
                                        className={`register-input ${isFieldInvalid('phone') ? 'error' : ''}`}
                                    />
                                    {isFieldInvalid('phone') && (
                                        <div className="register-error">
                                            {getFieldError('phone')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="register-form-section">
                            <h3 className="register-section-title">Место учебы</h3>

                            <div className="register-form-row">
                                <div className="register-form-group">
                                    <label className="register-label">Регион</label>
                                    <SearchableSelect
                                        value={formData.region}
                                        onChange={handleRegionChange}
                                        options={regions}
                                        placeholder="Выберите регион"
                                        isLoading={isLoadingRegions}
                                        error={isFieldInvalid('region')}
                                    />
                                    {isFieldInvalid('region') && (
                                        <div className="register-error">
                                            {getFieldError('region')}
                                        </div>
                                    )}
                                </div>
                                <div className="register-form-group">
                                    <label className="register-label">Населенный пункт</label>
                                    <SearchableSelect
                                        value={formData.city}
                                        onChange={handleCityChange}
                                        options={cities}
                                        placeholder="Выберите населенный пункт"
                                        isLoading={isLoadingCities}
                                        disabled={!formData.region}
                                        error={isFieldInvalid('city')}
                                    />
                                    {isFieldInvalid('city') && (
                                        <div className="register-error">
                                            {getFieldError('city')}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="register-form-group">
                                <label className="register-label">Учебное заведение</label>
                                <SearchableSelect
                                    value={formData.school}
                                    onChange={handleSchoolChange}
                                    options={schools}
                                    placeholder="Выберите школу"
                                    isLoading={isLoadingSchools}
                                    disabled={!formData.region || !formData.city}
                                    error={isFieldInvalid('school')}
                                />
                                {isFieldInvalid('school') && (
                                    <div className="register-error">
                                        {getFieldError('school')}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="register-form-section">
                            <h3 className="register-section-title">Информация об участии</h3>
                            
                            <div className="register-form-row">
                                <div className="register-form-group">
                                    <label className="register-label">Класс</label>
                                    <select
                                        name="grade"
                                        value={formData.grade}
                                        onChange={handleChange}
                                        className={`register-select ${isFieldInvalid('grade') ? 'error' : ''}`}
                                    >
                                        <option value="">Выберите класс</option>
                                        {[9, 10, 11].map((grade) => (
                                            <option key={grade} value={grade}>{grade} класс</option>
                                        ))}
                                    </select>
                                    {isFieldInvalid('grade') && (
                                        <div className="register-error">
                                            {getFieldError('grade')}
                                        </div>
                                    )}
                                </div>

                                <div className="register-form-group">
                                    <label className="register-label">Язык программирования</label>
                                    <select
                                        name="programming_language"
                                        value={formData.programming_language}
                                        onChange={handleChange}
                                        className={`register-select ${isFieldInvalid('programming_language') ? 'error' : ''}`}
                                    >
                                        <option value="">Выберите язык</option>
                                        <option value="C++">C++</option>
                                        <option value="Python">Python</option>
                                        <option value="Java">Java</option>
                                    </select>
                                    {isFieldInvalid('programming_language') && (
                                        <div className="register-error">
                                            {getFieldError('programming_language')}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="register-form-group">
                                <label className="register-label">Формат участия</label>
                                <div className="register-radio-group">
                                    <label className="register-radio">
                                        <input
                                            type="radio"
                                            name="participation_format"
                                            value="individual"
                                            checked={formData.participation_format === 'individual'}
                                            onChange={handleParticipationFormatChange}
                                        />
                                        <span className="register-radio-mark"></span>
                                        <span className="register-radio-label">Индивидуальное</span>
                                    </label>
                                    <label className="register-radio">
                                        <input
                                            type="radio"
                                            name="participation_format"
                                            value="team"
                                            checked={formData.participation_format === 'team'}
                                            onChange={handleParticipationFormatChange}
                                        />
                                        <span className="register-radio-mark"></span>
                                        <span className="register-radio-label">Командное</span>
                                    </label>
                                </div>
                                {isFieldInvalid('participation_format') && (
                                    <div className="register-error">
                                        {getFieldError('participation_format')}
                                    </div>
                                )}
                            </div>

                            {formData.birthday && (
                                <div className="register-checkbox-group">
                                    <label className="register-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={consent}
                                            onChange={(e) => {
                                                setConsent(e.target.checked);
                                                if (errors.consent) {
                                                    setErrors(prev => {
                                                        const newErrors = { ...prev };
                                                        delete newErrors.consent;
                                                        return newErrors;
                                                    });
                                                }
                                            }}
                                        />
                                        <span className="register-checkbox-mark"></span>
                                        <span className="register-checkbox-label">
                                            {isMinor() ? (
                                                <>
                                                    Являюсь родителем (законным представителем) участника и согласен на{' '}
                                                    <a 
                                                        href="/consent" 
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        обработку его персональных данных
                                                    </a>
                                                </>
                                            ) : (
                                                <>
                                                    Согласен на{' '}
                                                    <a 
                                                        href="/participant-consent" 
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        обработку моих персональных данных
                                                    </a>
                                                </>
                                            )}
                                        </span>
                                    </label>
                                    {errors.consent && (
                                        <div className="register-error">
                                            {errors.consent[0]}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="register-actions">
                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="register-submit-btn"
                            >
                                {isLoading ? 'Отправка...' : 'Зарегистрироваться'}
                            </button>
                            <p className="register-login-link">
                                Уже есть аккаунт?{' '}
                                <a 
                                    href="/login"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        navigate('/login');
                                    }}
                                >
                                    Войти
                                </a>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
});

export default RegisterPage;