import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Context } from "../index";
import { observer } from "mobx-react-lite";
import '../styles/login.css';

const LoginPage = observer(() => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const { store } = useContext(Context);
    const navigate = useNavigate();
    const location = useLocation();
    
    useEffect(() => {
        if (location.state?.registrationSuccess) {
            setSuccessMessage(location.state.message || 'Регистрация успешна!');
            navigate(location.pathname, { replace: true, state: {} });
        }
        
        const params = new URLSearchParams(location.search);
        if (params.get('activated') === 'true') {
            setSuccessMessage('Аккаунт успешно активирован! Теперь вы можете войти.');
            navigate(location.pathname, { replace: true });
        }
        if (params.get('activation_error') === 'true') {
            setErrors({ _message: 'Ошибка активации. Ссылка недействительна или истекла.' });
            navigate(location.pathname, { replace: true });
        }
    }, [location, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            await store.login(email, password);
            
            if (store.isAuth) {
                const params = new URLSearchParams(location.search);
                const teamToken = params.get('teamToken');
                
                if (teamToken) {
                    window.location.href = `/api/team/join/${teamToken}`;
                    return;
                }
                
                const from = location.state?.from;
                if (from && from.startsWith('/team/join/')) {
                    navigate(from);
                } else {
                    // Редирект в зависимости от роли
                    if (store.user.role === 'admin') {
                        navigate('/admin');
                    } else {
                        navigate('/profile');
                    }
                }
            }
        } catch (e) {
            setSuccessMessage('');
            const responseData = e.response?.data;
            const newErrors = {};

            if (responseData?.fieldErrors && Object.keys(responseData.fieldErrors).length > 0) {
                Object.assign(newErrors, responseData.fieldErrors);
            } else {
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
        <div className="login-page">
            <div className="login-content">
                {/* Hero Section */}
                <div className="login-hero">
                    <h1 className="login-title">Вход</h1>
                    <p className="login-subtitle">Войдите в свой аккаунт для участия в чемпионате</p>
                </div>

                {/* Form Card */}
                <div className="login-form-card">
                    {successMessage && (
                        <div className="login-alert login-alert-success">
                            {successMessage}
                            {successMessage.includes('активирован') && (
                                <div style={{ marginTop: '10px', fontSize: '14px' }}>
                                    После активации войдите в аккаунт
                                </div>
                            )}
                        </div>
                    )}
                    
                    {errors._message && (
                        <div className="login-alert login-alert-error">
                            {errors._message}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="login-form-group">
                            <label className="login-label">Email</label>
                            <input
                                type="email"
                                placeholder="Введите ваш email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (errors.email) setErrors(prev => ({ ...prev, email: [] }));
                                }}
                                className={`login-input ${isFieldInvalid('email') ? 'error' : ''}`}
                                required
                            />
                            {isFieldInvalid('email') && (
                                <div className="login-error">
                                    {getFieldError('email')}
                                </div>
                            )}
                        </div>
                        
                        <div className="login-form-group">
                            <label className="login-label">Пароль</label>
                            <input
                                type="password"
                                placeholder="Введите ваш пароль"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (errors.password) setErrors(prev => ({ ...prev, password: [] }));
                                }}
                                className={`login-input ${isFieldInvalid('password') ? 'error' : ''}`}
                                required
                            />
                            {isFieldInvalid('password') && (
                                <div className="login-error">
                                    {getFieldError('password')}
                                </div>
                            )}
                        </div>

                        <div className="login-forgot">
                            <a
                                href="/reset-password-request"
                                className="login-forgot-link"
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate('/reset-password-request');
                                }}
                            >
                                Забыли пароль?
                            </a>
                        </div>
                        
                        <div className="login-actions">
                            <button 
                                type="submit"
                                className="login-submit-btn"
                            >
                                Войти
                            </button>
                            
                            <p className="login-register-link">
                                Нет аккаунта? <a 
                                    href="/register"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        navigate('/register');
                                    }}
                                >
                                    Зарегистрироваться
                                </a>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
});

export default LoginPage;