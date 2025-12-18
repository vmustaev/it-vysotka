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
            if (error.response?.data?.fieldErrors) {
                setErrors(error.response.data.fieldErrors);
            } else if (error.response?.data?.message) {
                setErrors({ general: [error.response.data.message] });
            } else {
                setErrors({ general: ['Ошибка при сбросе пароля'] });
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
        <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
            <h2>Установка нового пароля</h2>
            
            {!token ? (
                <div style={{
                    background: '#fff3cd',
                    color: '#856404',
                    padding: '15px',
                    borderRadius: '4px',
                    marginBottom: '20px'
                }}>
                    Загрузка...
                </div>
            ) : (
                <>
                    {successMessage && (
                        <div style={{
                            background: '#e8f5e9',
                            color: '#2e7d32',
                            padding: '15px',
                            borderRadius: '4px',
                            marginBottom: '20px',
                            border: '1px solid #c8e6c9'
                        }}>
                            {successMessage}
                            <div style={{ marginTop: '10px', fontSize: '14px' }}>
                                Перенаправление на страницу входа...
                            </div>
                        </div>
                    )}
                    
                    {errors.general && (
                        <div style={{
                            background: '#ffebee',
                            color: '#c62828',
                            padding: '10px',
                            borderRadius: '4px',
                            marginBottom: '15px'
                        }}>
                            {errors.general[0]}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <input
                                type="password"
                                placeholder="Новый пароль"
                                value={newPassword}
                                onChange={(e) => {
                                    setNewPassword(e.target.value);
                                    if (errors.newPassword) setErrors(prev => ({ ...prev, newPassword: [] }));
                                }}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: `1px solid ${isFieldInvalid('newPassword') ? 'red' : '#ccc'}`,
                                    borderRadius: '4px'
                                }}
                                required
                                disabled={isLoading}
                            />
                            {isFieldInvalid('newPassword') && (
                                <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                                    {getFieldError('newPassword')}
                                </div>
                            )}
                            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                Минимум 8 символов, заглавные и строчные буквы, цифры
                            </div>
                        </div>
                        
                        <div>
                            <input
                                type="password"
                                placeholder="Подтвердите пароль"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: [] }));
                                }}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: `1px solid ${isFieldInvalid('confirmPassword') ? 'red' : '#ccc'}`,
                                    borderRadius: '4px'
                                }}
                                required
                                disabled={isLoading}
                            />
                            {isFieldInvalid('confirmPassword') && (
                                <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                                    {getFieldError('confirmPassword')}
                                </div>
                            )}
                        </div>
                        
                        <button 
                            type="submit"
                            disabled={isLoading}
                            style={{
                                padding: '12px',
                                background: isLoading ? '#ccc' : '#4CAF50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: isLoading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isLoading ? 'Сохранение...' : 'Сохранить новый пароль'}
                        </button>
                    </form>
                </>
            )}
            
            <div style={{ textAlign: 'center', marginTop: '15px' }}>
                <a 
                    href="/login" 
                    style={{ color: '#2196F3', textDecoration: 'none' }}
                    onClick={(e) => {
                        e.preventDefault();
                        navigate('/login');
                    }}
                >
                    Вернуться ко входу
                </a>
            </div>
        </div>
    );
};

export default ResetPassword;