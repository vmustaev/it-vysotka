import React, { useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from "../index";
import { observer } from "mobx-react-lite";
import SearchableSelect from '../components/SearchableSelect';
import $api from '../http';

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
        participation_format: 'individual'
    });

    const [parentConsent, setParentConsent] = useState(false);

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const { store } = useContext(Context);
    const navigate = useNavigate();

    const [regions, setRegions] = useState([]);
    const [cities, setCities] = useState([]);
    const [schools, setSchools] = useState([]);
    const [isLoadingRegions, setIsLoadingRegions] = useState(false);
    const [isLoadingCities, setIsLoadingCities] = useState(false);
    const [isLoadingSchools, setIsLoadingSchools] = useState(false);

    useEffect(() => {
        loadRegions();
    }, []);

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
                phone: phoneToSend ? `+${phoneToSend}` : '',
                parentConsent: parentConsent
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
            } else {
                if (responseData?.message) {
                    newErrors._message = responseData.message;
                } else {
                    newErrors._message = 'Ошибка регистрации';
                }
            }
            
            setErrors(newErrors);
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

    return (
        <div className="page">
            <div className="form-container">
                <div className="form-card">
                    <h2 className="form-title">Регистрация</h2>
                    
                    {errors._message && (
                        <div className="alert alert-error">
                            {errors._message}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="form">
                <div className="form-group">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`form-input ${isFieldInvalid('email') ? 'error' : ''}`}
                    />
                    {isFieldInvalid('email') && (
                        <div className="form-error">
                            {getFieldError('email')}
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <input
                        type="password"
                        name="password"
                        placeholder="Пароль"
                        value={formData.password}
                        onChange={handleChange}
                        className={`form-input ${isFieldInvalid('password') ? 'error' : ''}`}
                    />
                    {isFieldInvalid('password') && (
                        <div className="form-error">
                            {getFieldError('password')}
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <input
                        type="password"
                        name="password_confirmation"
                        placeholder="Подтверждение пароля"
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        className={`form-input ${isFieldInvalid('password_confirmation') ? 'error' : ''}`}
                    />
                    {isFieldInvalid('password_confirmation') && (
                        <div className="form-error">
                            {getFieldError('password_confirmation')}
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <input
                        type="text"
                        name="last_name"
                        placeholder="Фамилия"
                        value={formData.last_name}
                        onChange={handleChange}
                        className={`form-input ${isFieldInvalid('last_name') ? 'error' : ''}`}
                    />
                    {isFieldInvalid('last_name') && (
                        <div className="form-error">
                            {getFieldError('last_name')}
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <input
                        type="text"
                        name="first_name"
                        placeholder="Имя"
                        value={formData.first_name}
                        onChange={handleChange}
                        className={`form-input ${isFieldInvalid('first_name') ? 'error' : ''}`}
                    />
                    {isFieldInvalid('first_name') && (
                        <div className="form-error">
                            {getFieldError('first_name')}
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <input
                        type="text"
                        name="second_name"
                        placeholder="Отчество (необязательно)"
                        value={formData.second_name}
                        onChange={handleChange}
                        className={`form-input ${isFieldInvalid('second_name') ? 'error' : ''}`}
                    />
                    {isFieldInvalid('second_name') && (
                        <div className="form-error">
                            {getFieldError('second_name')}
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-label">Дата рождения</label>
                    <input
                        type="date"
                        name="birthday"
                        value={formData.birthday}
                        onChange={handleChange}
                        className={`form-input ${isFieldInvalid('birthday') ? 'error' : ''}`}
                    />
                    {isFieldInvalid('birthday') && (
                        <div className="form-error">
                            {getFieldError('birthday')}
                        </div>
                    )}
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <SearchableSelect
                            value={formData.region}
                            onChange={handleRegionChange}
                            options={regions}
                            placeholder="Регион"
                            isLoading={isLoadingRegions}
                            error={isFieldInvalid('region')}
                        />
                        {isFieldInvalid('region') && (
                            <div className="form-error">
                                {getFieldError('region')}
                            </div>
                        )}
                    </div>
                    <div className="form-group">
                        <SearchableSelect
                            value={formData.city}
                            onChange={handleCityChange}
                            options={cities}
                            placeholder="Населенный пункт"
                            isLoading={isLoadingCities}
                            disabled={!formData.region}
                            error={isFieldInvalid('city')}
                        />
                        {isFieldInvalid('city') && (
                            <div className="form-error">
                                {getFieldError('city')}
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <SearchableSelect
                        value={formData.school}
                        onChange={handleSchoolChange}
                        options={schools}
                        placeholder="Школа"
                        isLoading={isLoadingSchools}
                        disabled={!formData.region || !formData.city}
                        error={isFieldInvalid('school')}
                    />
                    {isFieldInvalid('school') && (
                        <div className="form-error">
                            {getFieldError('school')}
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <input
                        type="tel"
                        name="phone"
                        placeholder="Телефон"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        className={`form-input ${isFieldInvalid('phone') ? 'error' : ''}`}
                    />
                    {isFieldInvalid('phone') && (
                        <div className="form-error">
                            {getFieldError('phone')}
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <select
                        name="grade"
                        value={formData.grade}
                        onChange={handleChange}
                        className={`form-select ${isFieldInvalid('grade') ? 'error' : ''}`}
                    >
                        <option value="">Выберите класс</option>
                        {[...Array(11)].map((_, i) => (
                            <option key={i} value={i + 1}>{i + 1} класс</option>
                        ))}
                    </select>
                    {isFieldInvalid('grade') && (
                        <div className="form-error">
                            {getFieldError('grade')}
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <select
                        name="programming_language"
                        value={formData.programming_language}
                        onChange={handleChange}
                        className={`form-select ${isFieldInvalid('programming_language') ? 'error' : ''}`}
                    >
                        <option value="">Выберите язык программирования</option>
                        <option value="C++">C++</option>
                        <option value="Python">Python</option>
                        <option value="Java">Java</option>
                    </select>
                    {isFieldInvalid('programming_language') && (
                        <div className="form-error">
                            {getFieldError('programming_language')}
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-label">Формат участия</label>
                    <div className="form-radio-group">
                        <label className="form-radio">
                            <input
                                type="radio"
                                name="participation_format"
                                value="individual"
                                checked={formData.participation_format === 'individual'}
                                onChange={handleChange}
                                className="form-radio-input"
                            />
                            <span className="form-radio-custom"></span>
                            <span className="form-radio-label">Индивидуальное участие</span>
                        </label>
                        <label className="form-radio">
                            <input
                                type="radio"
                                name="participation_format"
                                value="team"
                                checked={formData.participation_format === 'team'}
                                onChange={handleChange}
                                className="form-radio-input"
                            />
                            <span className="form-radio-custom"></span>
                            <span className="form-radio-label">Командное участие</span>
                        </label>
                    </div>
                    {isFieldInvalid('participation_format') && (
                        <div className="form-error">
                            {getFieldError('participation_format')}
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-checkbox">
                        <input
                            type="checkbox"
                            checked={parentConsent}
                            onChange={(e) => {
                                setParentConsent(e.target.checked);
                                if (errors.parentConsent) {
                                    setErrors(prev => {
                                        const newErrors = { ...prev };
                                        delete newErrors.parentConsent;
                                        return newErrors;
                                    });
                                }
                            }}
                            className="form-checkbox-input"
                        />
                        <span className="form-checkbox-label">
                            Являюсь родителем (законным представителем) участника и согласен на{' '}
                            <a 
                                href="/consent" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="form-checkbox-link"
                                onClick={(e) => e.stopPropagation()}
                            >
                                обработку его персональных данных
                            </a>
                        </span>
                    </label>
                    {errors.parentConsent && (
                        <div className="form-error">
                            {errors.parentConsent[0]}
                        </div>
                    )}
                </div>

                <button 
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary btn-lg"
                >
                    {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                </button>

                <div className="text-center">
                    <a 
                        href="/login" 
                        className="text-primary"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate('/login');
                        }}
                    >
                        Уже есть аккаунт? Войти
                    </a>
                </div>
            </form>
                </div>
            </div>
        </div>
    );
});

export default RegisterPage;