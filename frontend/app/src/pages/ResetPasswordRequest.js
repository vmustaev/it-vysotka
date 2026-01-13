import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../http';

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
        <div className="page">
            <div className="form-container">
                <div className="form-card">
                    <h2 className="form-title">Сброс пароля</h2>
                    <p style={{ marginBottom: '20px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                        Введите email, указанный при регистрации. Мы отправим вам ссылку для сброса пароля.
                    </p>
                    
                    {successMessage && (
                        <div className="alert alert-success">
                            {successMessage}
                            <div style={{ marginTop: '10px', fontSize: '14px' }}>
                                Вы будете перенаправлены на страницу входа через 5 секунд...
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
                                disabled={isLoading}
                            />
                            {isFieldInvalid('email') && (
                                <div className="form-error">
                                    {getFieldError('email')}
                                </div>
                            )}
                        </div>
                        
                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-secondary btn-lg"
                        >
                            {isLoading ? 'Отправка...' : 'Отправить ссылку для сброса'}
                        </button>
                    </form>
                    
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

export default ResetPasswordRequest;