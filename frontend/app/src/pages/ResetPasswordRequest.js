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
            
            // Копируем fieldErrors если есть
            if (responseData?.fieldErrors && Object.keys(responseData.fieldErrors).length > 0) {
                Object.assign(newErrors, responseData.fieldErrors);
            } else {
                // Показываем общее сообщение только если НЕТ ошибок полей
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
        <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
            <h2>Сброс пароля</h2>
            <p style={{ marginBottom: '20px', color: '#666' }}>
                Введите email, указанный при регистрации. Мы отправим вам ссылку для сброса пароля.
            </p>
            
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
                        Вы будете перенаправлены на страницу входа через 5 секунд...
                    </div>
                </div>
            )}
            
            {errors._message && (
                <div style={{
                    background: '#ffebee',
                    color: '#c62828',
                    padding: '10px',
                    borderRadius: '4px',
                    marginBottom: '15px'
                }}>
                    {errors._message}
                </div>
            )}
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email) setErrors(prev => ({ ...prev, email: [] }));
                        }}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: `1px solid ${isFieldInvalid('email') ? 'red' : '#ccc'}`,
                            borderRadius: '4px'
                        }}
                        required
                        disabled={isLoading}
                    />
                    {isFieldInvalid('email') && (
                        <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                            {getFieldError('email')}
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
                    {isLoading ? 'Отправка...' : 'Отправить ссылку для сброса'}
                </button>
            </form>
            
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

export default ResetPasswordRequest;