import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../http';
import Toast from '../components/Toast';
import '../styles/reset-password.css';

const ResetPasswordRequest = () => {
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState({ type: null, message: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setNotification({ type: null, message: '' });
        setIsLoading(true);

        try {
            await axios.post('/password/reset/request', { email });
            
            navigate('/login', {
                state: {
                    toastMessage: 'Ссылка для сброса пароля отправлена на ваш email',
                    toastType: 'success'
                }
            });
        } catch (error) {
            console.log('Reset password error:', error);
            console.log('Error response:', error.response?.data);
            
            const responseData = error.response?.data;
            const newErrors = {};
            
            if (responseData?.fieldErrors && Object.keys(responseData.fieldErrors).length > 0) {
                Object.assign(newErrors, responseData.fieldErrors);
                setErrors(newErrors);
            } else {
                const errorMessage = responseData?.message || 'Ошибка при отправке запроса';
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
                <div className="reset-hero">
                    <h1 className="reset-title">Сброс пароля</h1>
                </div>

                <div className="reset-form-card">
                    <form onSubmit={handleSubmit} className="reset-form">
                        <div className="reset-form-group">
                            <label className="reset-label">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (errors.email) setErrors(prev => ({ ...prev, email: [] }));
                                }}
                                className={`reset-input ${isFieldInvalid('email') ? 'error' : ''}`}
                                required
                                disabled={isLoading}
                            />
                            {isFieldInvalid('email') && (
                                <div className="reset-error">
                                    {getFieldError('email')}
                                </div>
                            )}
                        </div>
                        
                        <div className="reset-actions">
                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="reset-submit-btn"
                            >
                                {isLoading ? 'Отправка...' : 'Отправить ссылку для сброса'}
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
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordRequest;