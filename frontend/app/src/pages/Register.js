import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from "../index";
import { observer } from "mobx-react-lite";

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
        programming_language: 'C++',
        phone: '',
        format: 'онлайн',
        grade: ''
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const { store } = useContext(Context);
    const navigate = useNavigate();

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isLoading) return;
        
        setIsLoading(true);
        setErrors({});
        
        try {
            await store.registration(formData);
            
            navigate('/login', { 
            state: { 
                registrationSuccess: true,
                message: 'Регистрация успешна! Пожалуйста, проверьте вашу почту для активации аккаунта.'
            } 
        });
        } catch (e) {
            const responseData = e.response?.data;
            const newErrors = {};
            
            // Копируем fieldErrors если есть
            if (responseData?.fieldErrors && Object.keys(responseData.fieldErrors).length > 0) {
                Object.assign(newErrors, responseData.fieldErrors);
            } else {
                // Показываем общее сообщение только если НЕТ ошибок полей
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
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2>Регистрация</h2>
            
            {errors._message && (
                <div style={{
                    background: '#ffebee',
                    color: '#c62828',
                    padding: '10px',
                    borderRadius: '4px',
                    marginBottom: '15px'
                }}>
                    {errors._message}
                </div>
            )}
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email*"
                        value={formData.email}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: `1px solid ${isFieldInvalid('email') ? 'red' : '#ccc'}`,
                            borderRadius: '4px'
                        }}
                    />
                    {isFieldInvalid('email') && (
                        <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                            {getFieldError('email')}
                        </div>
                    )}
                </div>

                <div>
                    <input
                        type="password"
                        name="password"
                        placeholder="Пароль*"
                        value={formData.password}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: `1px solid ${isFieldInvalid('password') ? 'red' : '#ccc'}`,
                            borderRadius: '4px'
                        }}
                    />
                    {isFieldInvalid('password') && (
                        <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                            {getFieldError('password')}
                        </div>
                    )}
                </div>

                <div>
                    <input
                        type="password"
                        name="password_confirmation"
                        placeholder="Подтверждение пароля*"
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: `1px solid ${isFieldInvalid('password_confirmation') ? 'red' : '#ccc'}`,
                            borderRadius: '4px'
                        }}
                    />
                    {isFieldInvalid('password_confirmation') && (
                        <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                            {getFieldError('password_confirmation')}
                        </div>
                    )}
                </div>

                <div>
                    <input
                        type="text"
                        name="last_name"
                        placeholder="Фамилия* (только кириллица)"
                        value={formData.last_name}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: `1px solid ${isFieldInvalid('last_name') ? 'red' : '#ccc'}`,
                            borderRadius: '4px'
                        }}
                    />
                    {isFieldInvalid('last_name') && (
                        <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                            {getFieldError('last_name')}
                        </div>
                    )}
                </div>

                <div>
                    <input
                        type="text"
                        name="first_name"
                        placeholder="Имя* (только кириллица)"
                        value={formData.first_name}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: `1px solid ${isFieldInvalid('first_name') ? 'red' : '#ccc'}`,
                            borderRadius: '4px'
                        }}
                    />
                    {isFieldInvalid('first_name') && (
                        <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                            {getFieldError('first_name')}
                        </div>
                    )}
                </div>

                <div>
                    <input
                        type="text"
                        name="second_name"
                        placeholder="Отчество (только кириллица)"
                        value={formData.second_name}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: `1px solid ${isFieldInvalid('second_name') ? 'red' : '#ccc'}`,
                            borderRadius: '4px'
                        }}
                    />
                    {isFieldInvalid('second_name') && (
                        <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                            {getFieldError('second_name')}
                        </div>
                    )}
                </div>

                <div>
                    <label>Дата рождения*</label>
                    <input
                        type="date"
                        name="birthday"
                        value={formData.birthday}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: `1px solid ${isFieldInvalid('birthday') ? 'red' : '#ccc'}`,
                            borderRadius: '4px'
                        }}
                    />
                    {isFieldInvalid('birthday') && (
                        <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                            {getFieldError('birthday')}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                        <input
                            type="text"
                            name="region"
                            placeholder="Регион*"
                            value={formData.region}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: `1px solid ${isFieldInvalid('region') ? 'red' : '#ccc'}`,
                                borderRadius: '4px'
                            }}
                        />
                        {isFieldInvalid('region') && (
                            <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                                {getFieldError('region')}
                            </div>
                        )}
                    </div>
                    <div style={{ flex: 1 }}>
                        <input
                            type="text"
                            name="city"
                            placeholder="Город*"
                            value={formData.city}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: `1px solid ${isFieldInvalid('city') ? 'red' : '#ccc'}`,
                                borderRadius: '4px'
                            }}
                        />
                        {isFieldInvalid('city') && (
                            <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                                {getFieldError('city')}
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <input
                        type="text"
                        name="school"
                        placeholder="Школа*"
                        value={formData.school}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: `1px solid ${isFieldInvalid('school') ? 'red' : '#ccc'}`,
                            borderRadius: '4px'
                        }}
                    />
                    {isFieldInvalid('school') && (
                        <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                            {getFieldError('school')}
                        </div>
                    )}
                </div>

                <div>
                    <input
                        type="tel"
                        name="phone"
                        placeholder="Телефон* (+7XXXXXXXXXX)"
                        value={formData.phone}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: `1px solid ${isFieldInvalid('phone') ? 'red' : '#ccc'}`,
                            borderRadius: '4px'
                        }}
                    />
                    {isFieldInvalid('phone') && (
                        <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                            {getFieldError('phone')}
                        </div>
                    )}
                </div>

                <div>
                    <select
                        name="grade"
                        value={formData.grade}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: `1px solid ${isFieldInvalid('grade') ? 'red' : '#ccc'}`,
                            borderRadius: '4px'
                        }}
                    >
                        <option value="">Выберите класс*</option>
                        {[...Array(11)].map((_, i) => (
                            <option key={i} value={i + 1}>{i + 1} класс</option>
                        ))}
                    </select>
                    {isFieldInvalid('grade') && (
                        <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                            {getFieldError('grade')}
                        </div>
                    )}
                </div>

                <div>
                    <select
                        name="programming_language"
                        value={formData.programming_language}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: `1px solid ${isFieldInvalid('programming_language') ? 'red' : '#ccc'}`,
                            borderRadius: '4px'
                        }}
                    >
                        <option value="C++">C++</option>
                        <option value="Python">Python</option>
                        <option value="Java">Java</option>
                    </select>
                    {isFieldInvalid('programming_language') && (
                        <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                            {getFieldError('programming_language')}
                        </div>
                    )}
                </div>

                <div>
                    <select
                        name="format"
                        value={formData.format}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: `1px solid ${isFieldInvalid('format') ? 'red' : '#ccc'}`,
                            borderRadius: '4px'
                        }}
                    >
                        <option value="онлайн">Онлайн</option>
                        <option value="очный">Очный</option>
                    </select>
                    {isFieldInvalid('format') && (
                        <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                            {getFieldError('format')}
                        </div>
                    )}
                </div>

                <button 
                    type="submit"
                    disabled={isLoading}
                    style={{
                        padding: '12px',
                        background: isLoading ? '#cccccc' : '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        opacity: isLoading ? 0.7 : 1
                    }}
                >
                    {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                </button>

                <div style={{ textAlign: 'center' }}>
                    <a 
                        href="/login" 
                        style={{ color: '#2196F3', textDecoration: 'none' }}
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
    );
});

export default RegisterPage;