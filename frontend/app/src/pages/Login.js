import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Context } from "../index";
import { observer } from "mobx-react-lite";
import Toast from '../components/Toast';
import '../styles/login.css';

const LoginPage = observer(() => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [notification, setNotification] = useState({ type: null, message: '' });
    const { store } = useContext(Context);
    const navigate = useNavigate();
    const location = useLocation();
    
    useEffect(() => {
        if (location.state?.registrationSuccess) {
            setNotification({ 
                type: 'success', 
                message: location.state.message || 'Регистрация успешна!' 
            });
            navigate(location.pathname, { replace: true, state: {} });
        }
        
        if (location.state?.toastMessage) {
            setNotification({ 
                type: location.state.toastType || 'success', 
                message: location.state.toastMessage 
            });
            navigate(location.pathname, { replace: true, state: {} });
        }
        
        const params = new URLSearchParams(location.search);
        if (params.get('activated') === 'true') {
            setNotification({ 
                type: 'success', 
                message: 'Аккаунт успешно активирован! Теперь вы можете войти.' 
            });
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
            const responseData = e.response?.data;
            const newErrors = {};

            if (responseData?.fieldErrors && Object.keys(responseData.fieldErrors).length > 0) {
                Object.assign(newErrors, responseData.fieldErrors);
                setErrors(newErrors);
            } else {
                let errorMessage = 'Ошибка входа';
                if (responseData?.message) {
                    errorMessage = responseData.message;
                } else if (responseData?.errors && responseData.errors.length > 0) {
                    errorMessage = Array.isArray(responseData.errors) ? responseData.errors[0] : responseData.errors;
                }
                setNotification({ type: 'error', message: errorMessage });
            }
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
            {notification.message && (
                <Toast
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification({ type: null, message: '' })}
                />
            )}
            
            <div className="login-content">
                {/* Hero Section */}
                <div className="login-hero">
                    <h1 className="login-title">Вход</h1>
                </div>

                {/* Form Card */}
                <div className="login-form-card">
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="login-form-group">
                            <label className="login-label">Email</label>
                            <input
                                type="email"
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