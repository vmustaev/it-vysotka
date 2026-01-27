import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../http';
import '../styles/reset-password.css';

const ResetPasswordRequest = () => {
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSuccessMessage('');
        setIsLoading(true);

        try {
            await axios.post('/password/reset/request', { email });
            
            setSuccessMessage('Ссылка для сброса пароля отправлена на ваш email. Проверьте почту.');
            setEmail('');
            
            setTimeout(() => {
                navigate('/login');
            }, 5000);
        } catch (error) {
            console.log('Reset password error:', error);
            console.log('Error response:', error.response?.data);
            
            const responseData = error.response?.data;
            const newErrors = {};
            
            if (responseData?.fieldErrors && Object.keys(responseData.fieldErrors).length > 0) {
                Object.assign(newErrors, responseData.fieldErrors);
            } else {
                if (responseData?.message) {
                    newErrors._message = responseData.message;
                } else {
                    newErrors._message = 'Ошибка при отправке запроса';
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
        <div className="reset-page">
            <div className="reset-content">
                {/* Hero Section */}
                <div className="reset-hero">
                    <h1 className="reset-title">Сброс пароля</h1>
                    <p className="reset-subtitle">
                        Введите email, указанный при регистрации. Мы отправим вам ссылку для сброса пароля.
                    </p>
                </div>

                {/* Form Card */}
                <div className="reset-form-card">
                    {successMessage && (
                        <div className="reset-alert reset-alert-success">
                            {successMessage}
                            <div style={{ marginTop: '10px', fontSize: '14px' }}>
                                Вы будете перенаправлены на страницу входа через 5 секунд...
                            </div>
                        </div>
                    )}
                    
                    {errors._message && (
                        <div className="reset-alert reset-alert-error">
                            {errors._message}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="reset-form">
                        <div className="reset-form-group">
                            <label className="reset-label">Email</label>
                            <input
                                type="email"
                                placeholder="Введите ваш email"
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