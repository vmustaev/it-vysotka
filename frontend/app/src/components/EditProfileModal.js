import React, { useState, useEffect } from 'react';
import SearchableSelect from './SearchableSelect';
import $api from '../http';
import UserService from '../services/UserService';
import '../styles/register.css';
import '../styles/profile.css';

const EditProfileModal = ({ isOpen, onClose, profile, onSave, userId = null, showHistoryOnOpen = false }) => {
    const [formData, setFormData] = useState({
        last_name: '',
        first_name: '',
        second_name: '',
        birthday: '',
        region: '',
        city: '',
        school: '',
        programming_language: '',
        phone: '',
        grade: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [regions, setRegions] = useState([]);
    const [cities, setCities] = useState([]);
    const [schools, setSchools] = useState([]);
    const [isLoadingRegions, setIsLoadingRegions] = useState(false);
    const [isLoadingCities, setIsLoadingCities] = useState(false);
    const [isLoadingSchools, setIsLoadingSchools] = useState(false);
    const [profileHistory, setProfileHistory] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadRegions();
            if (profile) {
                // Обрабатываем данные в разных форматах (из Profile или из AttendanceService)
                const lastName = profile.last_name || profile.lastName || '';
                const firstName = profile.first_name || profile.firstName || '';
                const secondName = profile.second_name || profile.secondName || '';
                
                setFormData({
                    last_name: lastName,
                    first_name: firstName,
                    second_name: secondName,
                    birthday: profile.birthday ? (profile.birthday.split('T')[0] || profile.birthday) : '',
                    region: profile.region || '',
                    city: profile.city || '',
                    school: profile.school || '',
                    programming_language: profile.programming_language || '',
                    phone: profile.phone || '',
                    grade: profile.grade ? profile.grade.toString() : ''
                });
                
                if (profile.region) {
                    loadCities(profile.region).then(() => {
                        if (profile.city) {
                            loadSchools(profile.region, profile.city);
                        }
                    });
                }
            }
            setErrors({});
            // Автоматически показываем историю, если открыли через клик на "Есть изменения"
            setShowHistory(showHistoryOnOpen);
            
            // Загружаем историю, если редактирует волонтер
            if (userId) {
                loadProfileHistory();
            }
        }
    }, [isOpen, profile, userId]);

    const loadProfileHistory = async () => {
        if (!userId) return;
        try {
            setIsLoadingHistory(true);
            const response = await UserService.getProfileHistory(userId);
            setProfileHistory(response.data.data || []);
        } catch (error) {
            console.error('Ошибка загрузки истории:', error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    useEffect(() => {
        if (formData.region && isOpen) {
            loadCities(formData.region);
        } else if (!formData.region) {
            setCities([]);
            setSchools([]);
        }
    }, [formData.region, isOpen]);

    useEffect(() => {
        if (formData.region && formData.city && isOpen) {
            loadSchools(formData.region, formData.city);
        } else {
            setSchools([]);
        }
    }, [formData.region, formData.city, isOpen]);

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

    const handleFieldChange = (e) => {
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
            
            const dataToSend = {
                ...formData,
                phone: phoneToSend ? `+${phoneToSend}` : ''
            };
            
            if (userId) {
                // Для волонтера - редактирование другого пользователя
                await $api.put(`/volunteer/participants/${userId}/profile`, dataToSend);
            } else {
                // Для участника - редактирование своего профиля
                await $api.put('/user/profile', dataToSend);
            }
            
            if (onSave) {
                onSave();
            }
            onClose();
        } catch (error) {
            const responseData = error.response?.data;
            const newErrors = {};
            
            if (responseData?.fieldErrors && Object.keys(responseData.fieldErrors).length > 0) {
                Object.assign(newErrors, responseData.fieldErrors);
                setErrors(newErrors);
            } else {
                const errorMessage = responseData?.message || 'Ошибка обновления профиля';
                setErrors({ _general: [errorMessage] });
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

    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleBackdropClick}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                <div className="modal-header">
                    <h2>Редактирование личных данных</h2>
                    <button 
                        className="modal-close"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        ×
                    </button>
                </div>

                <div style={{ overflowY: 'auto', flex: 1 }}>
                <form onSubmit={handleSubmit} className="register-form" style={{ padding: '24px 32px' }}>
                    {errors._general && (
                        <div className="register-error" style={{ marginBottom: '20px', padding: '12px', background: '#fee2e2', borderRadius: '8px' }}>
                            {errors._general[0]}
                        </div>
                    )}

                    <div className="register-form-section">
                        <h3 className="register-section-title">Личные данные</h3>

                        <div className="register-form-row register-form-row-3">
                            <div className="register-form-group">
                                <label className="register-label">Фамилия</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleFieldChange}
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
                                    onChange={handleFieldChange}
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
                                    onChange={handleFieldChange}
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
                                    onChange={handleFieldChange}
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
                                    onChange={handleFieldChange}
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
                                    onChange={handleFieldChange}
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
                    </div>

                    <div className="register-actions" style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px' }}>
                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="register-submit-btn"
                        >
                            {isLoading ? 'Сохранение...' : 'Сохранить'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="btn btn-outline"
                        >
                            Отмена
                        </button>
                    </div>
                </form>

                {/* История изменений (только для волонтера) */}
                {userId && (
                    <div style={{ padding: '24px 32px', borderTop: '1px solid #e2e8f0' }}>
                        <button
                            type="button"
                            onClick={() => setShowHistory(!showHistory)}
                            className="btn btn-outline"
                            style={{ 
                                width: '100%', 
                                marginBottom: showHistory ? '16px' : '0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            {showHistory ? 'Скрыть историю изменений' : 'Показать историю изменений'}
                        </button>

                        {showHistory && (
                            <div style={{ marginTop: '16px' }}>
                                {isLoadingHistory ? (
                                    <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                                        Загрузка истории...
                                    </div>
                                ) : profileHistory.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                                        История изменений пуста
                                    </div>
                                ) : (
                                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        {profileHistory.map((record) => (
                                            <div 
                                                key={record.id} 
                                                style={{ 
                                                    padding: '12px', 
                                                    marginBottom: '8px', 
                                                    background: '#f8fafc', 
                                                    borderRadius: '8px',
                                                    border: '1px solid #e2e8f0'
                                                }}
                                            >
                                                <div style={{ 
                                                    display: 'flex', 
                                                    justifyContent: 'space-between', 
                                                    alignItems: 'center',
                                                    marginBottom: '8px'
                                                }}>
                                                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                                                        {record.editedBy ? (
                                                            <>
                                                                Изменено: <strong>{record.editedBy.name}</strong> 
                                                                {record.editedBy.role === 'volunteer' && ' (волонтер)'}
                                                                {record.editedBy.role === 'admin' && ' (администратор)'}
                                                                {record.editedBy.role === 'participant' && ' (участник)'}
                                                            </>
                                                        ) : 'Неизвестно'}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                                                        {new Date(record.createdAt).toLocaleString('ru-RU')}
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: '13px' }}>
                                                    {Object.entries(record.changes).map(([field, change]) => {
                                                        const fieldNames = {
                                                            last_name: 'Фамилия',
                                                            first_name: 'Имя',
                                                            second_name: 'Отчество',
                                                            birthday: 'Дата рождения',
                                                            region: 'Регион',
                                                            city: 'Город',
                                                            school: 'Школа',
                                                            programming_language: 'Язык программирования',
                                                            phone: 'Телефон',
                                                            grade: 'Класс'
                                                        };
                                                        return (
                                                            <div key={field} style={{ marginBottom: '4px' }}>
                                                                <strong>{fieldNames[field] || field}:</strong>{' '}
                                                                <span style={{ color: '#dc2626' }}>{change.old || '(пусто)'}</span>
                                                                {' → '}
                                                                <span style={{ color: '#16a34a' }}>{change.new || '(пусто)'}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
                </div>
            </div>
        </div>
    );
};

export default EditProfileModal;

