import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../http';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [token, setToken] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tokenParam = params.get('token');
        
        if (!tokenParam) {
            navigate('/reset-password-request');
            return;
        }
        
        setToken(tokenParam);
    }, [location, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            setErrors({ confirmPassword: ['Пароли не совпадают'] });
            return;
        }
        
        setErrors({});
        setSuccessMessage('');
        setIsLoading(true);

        try {
            await axios.post('/password/reset', { 
                token, 
                newPassword, 
                confirmPassword 
            });
            
            setSuccessMessage('Пароль успешно изменен! Теперь вы можете войти с новым паролем.');
            setNewPassword('');
            setConfirmPassword('');
            
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            const responseData = error.response?.data;
            const newErrors = {};
            
            if (responseData?.fieldErrors && Object.keys(responseData.fieldErrors).length > 0) {
                Object.assign(newErrors, responseData.fieldErrors);
            } else {
                if (responseData?.message) {
                    newErrors._message = responseData.message;
                } else {
                    newErrors._message = 'Ошибка при сбросе пароля';
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
                    <h2 className="form-title">Установка нового пароля</h2>
                    
                    {!token ? (
                        <div className="alert alert-warning">
                            Загрузка...
                        </div>
                    ) : (
                        <>
                            {successMessage && (
                                <div className="alert alert-success">
                                    {successMessage}
                                    <div style={{ marginTop: '10px', fontSize: '14px' }}>
                                        Перенаправление на страницу входа...
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
                                        type="password"
                                        placeholder="Новый пароль"
                                        value={newPassword}
                                        onChange={(e) => {
                                            setNewPassword(e.target.value);
                                            if (errors.newPassword) setErrors(prev => ({ ...prev, newPassword: [] }));
                                        }}
                                        className={`form-input ${isFieldInvalid('newPassword') ? 'error' : ''}`}
                                        required
                                        disabled={isLoading}
                                    />
                                    {isFieldInvalid('newPassword') && (
                                        <div className="form-error">
                                            {getFieldError('newPassword')}
                                        </div>
                                    )}
                                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                                        Минимум 8 символов, заглавные и строчные буквы, цифры
                                    </div>
                                </div>
                                
                                <div className="form-group">
                                    <input
                                        type="password"
                                        placeholder="Подтвердите пароль"
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: [] }));
                                        }}
                                        className={`form-input ${isFieldInvalid('confirmPassword') ? 'error' : ''}`}
                                        required
                                        disabled={isLoading}
                                    />
                                    {isFieldInvalid('confirmPassword') && (
                                        <div className="form-error">
                                            {getFieldError('confirmPassword')}
                                        </div>
                                    )}
                                </div>
                                
                                <button 
                                    type="submit"
                                    disabled={isLoading}
                                    className="btn btn-secondary btn-lg"
                                >
                                    {isLoading ? 'Сохранение...' : 'Сохранить новый пароль'}
                                </button>
                            </form>
                        </>
                    )}
                    
                    <div className="text-center mt-lg">
                        <a 
                            href="/login" 
                            className="text-primary"
                            onClick={(e) => {
                                e.preventDefault();
                                navigate('/login');
                            }}
                        >
                            Вернуться ко входу
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;