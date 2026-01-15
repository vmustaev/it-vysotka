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
                    navigate('/profile');
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