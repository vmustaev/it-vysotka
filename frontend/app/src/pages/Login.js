import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Context } from "../index";
import { observer } from "mobx-react-lite";

const LoginPage = observer(() => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const { store } = useContext(Context);
    const navigate = useNavigate();
    const location = useLocation();
    
    useEffect(() => {
        // Обработка успешной регистрации
        if (location.state?.registrationSuccess) {
            setSuccessMessage(location.state.message || 'Регистрация успешна!');
            navigate(location.pathname, { replace: true, state: {} });
        }
        
        // Обработка активации через URL параметры
        const params = new URLSearchParams(location.search);
        if (params.get('activated') === 'true') {
            setSuccessMessage('Аккаунт успешно активирован! Теперь вы можете войти.');
            // Очищаем URL
            navigate(location.pathname, { replace: true });
        }
        if (params.get('activation_error') === 'true') {
            setErrors({ _message: 'Ошибка активации. Ссылка недействительна или истекла.' });
            // Очищаем URL
            navigate(location.pathname, { replace: true });
        }
    }, [location, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            await store.login(email, password);
            
            if (store.isAuth) {
                // Проверяем, есть ли teamToken в query параметрах
                const params = new URLSearchParams(location.search);
                const teamToken = params.get('teamToken');
                
                if (teamToken) {
                    // После входа переходим на API endpoint для присоединения к команде
                    // Используем относительный путь через nginx
                    window.location.href = `/api/team/join/${teamToken}`;
                    return;
                }
                
                // Если был переход со страницы присоединения к команде, возвращаемся туда
                const from = location.state?.from;
                if (from && from.startsWith('/team/join/')) {
                    navigate(from);
                } else {
                    navigate('/');
                }
            }
        } catch (e) {
            setSuccessMessage('');
            const responseData = e.response?.data;
            const newErrors = {};

            // Копируем fieldErrors если есть
            if (responseData?.fieldErrors && Object.keys(responseData.fieldErrors).length > 0) {
                Object.assign(newErrors, responseData.fieldErrors);
            } else {
                // Показываем общее сообщение только если НЕТ ошибок полей
                if (responseData?.message) {
                    newErrors._message = responseData.message;
                } else if (responseData?.errors && responseData.errors.length > 0) {
                    newErrors._message = Array.isArray(responseData.errors) ? responseData.errors[0] : responseData.errors;
                } else {
                    newErrors._message = 'Ошибка входа';
                }
            }
            
            setErrors(newErrors);
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
                    <h2 className="form-title">Вход</h2>
                    
                    {successMessage && (
                        <div className="alert alert-success">
                            {successMessage}
                            <div style={{ marginTop: '10px', fontSize: '14px' }}>
                                После активации войдите в аккаунт
                            </div>
                        </div>
                    )}
                    
                    {errors._message && (
                        <div className="alert alert-error">
                            {errors._message}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="form">
                        <div className="form-group">
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (errors.email) setErrors(prev => ({ ...prev, email: [] }));
                                }}
                                className={`form-input ${isFieldInvalid('email') ? 'error' : ''}`}
                                required
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
                                placeholder="Пароль"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (errors.password) setErrors(prev => ({ ...prev, password: [] }));
                                }}
                                className={`form-input ${isFieldInvalid('password') ? 'error' : ''}`}
                                required
                            />
                            {isFieldInvalid('password') && (
                                <div className="form-error">
                                    {getFieldError('password')}
                                </div>
                            )}
                        </div>
                        
                        <button 
                            type="submit"
                            className="btn btn-secondary btn-lg"
                        >
                            Войти
                        </button>
                    </form>
                    
                    <div className="text-center mt-lg">
                        <a 
                            href="/register" 
                            className="text-primary"
                            onClick={(e) => {
                                e.preventDefault();
                                navigate('/register');
                            }}
                        >
                            Нет аккаунта? Зарегистрироваться
                        </a>
                    </div>
                    <div className="text-center mt-sm">
                        <a
                            href="/reset-password-request"
                            className="text-secondary"
                            style={{ fontSize: '14px' }}
                            onClick={(e) => {
                                e.preventDefault();
                                navigate('/reset-password-request');
                            }}
                        >
                            Забыли пароль?
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default LoginPage;