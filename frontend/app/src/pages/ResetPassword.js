import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../http';
import Toast from '../components/Toast';
import '../styles/reset-password.css';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState({ type: null, message: '' });
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
        setNotification({ type: null, message: '' });
        setIsLoading(true);

        try {
            await axios.post('/password/reset', { 
                token, 
                newPassword, 
                confirmPassword 
            });
            
            navigate('/login', {
                state: {
                    toastMessage: 'Пароль успешно изменен! Теперь вы можете войти',
                    toastType: 'success'
                }
            });
        } catch (error) {
            const responseData = error.response?.data;
            const newErrors = {};
            
            if (responseData?.fieldErrors && Object.keys(responseData.fieldErrors).length > 0) {
                Object.assign(newErrors, responseData.fieldErrors);
                setErrors(newErrors);
            } else {
                const errorMessage = responseData?.message || 'Ошибка при сбросе пароля';
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

    return (
        <div className="reset-page">
            {notification.message && (
                <Toast
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification({ type: null, message: '' })}
                />
            )}
            
            <div className="reset-content">
                {/* Hero Section */}
                <div className="reset-hero">
                    <h1 className="reset-title">Установка нового пароля</h1>
                </div>

                {/* Form Card */}
                <div className="reset-form-card">
                    {!token ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                            Загрузка...
                        </div>
                    ) : (
                        <>
                            <form onSubmit={handleSubmit} className="reset-form">
                                <div className="reset-form-group">
                                    <label className="reset-label">Новый пароль</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => {
                                            setNewPassword(e.target.value);
                                            if (errors.newPassword) setErrors(prev => ({ ...prev, newPassword: [] }));
                                        }}
                                        className={`reset-input ${isFieldInvalid('newPassword') ? 'error' : ''}`}
                                        required
                                        disabled={isLoading}
                                    />
                                    {isFieldInvalid('newPassword') && (
                                        <div className="reset-error">
                                            {getFieldError('newPassword')}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="reset-form-group">
                                    <label className="reset-label">Подтверждение пароля</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: [] }));
                                        }}
                                        className={`reset-input ${isFieldInvalid('confirmPassword') ? 'error' : ''}`}
                                        required
                                        disabled={isLoading}
                                    />
                                    {isFieldInvalid('confirmPassword') && (
                                        <div className="reset-error">
                                            {getFieldError('confirmPassword')}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="reset-actions">
                                    <button 
                                        type="submit"
                                        disabled={isLoading}
                                        className="reset-submit-btn"
                                    >
                                        {isLoading ? 'Сохранение...' : 'Сохранить новый пароль'}
                                    </button>
                                    
                                    <p className="reset-back-link">
                                        <a 
                                            href="/login"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                navigate('/login');
                                            }}
                                        >
                                            Вернуться ко входу
                                        </a>
                                    </p>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;